import { SystemTilkobling, TilkoblingsStatus, TilkoblingsType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { dekrypter, krypter } from "@/lib/sikkerhet/kryptering";
import { logger } from "@/lib/logging/logger";
import {
  BilagsOppgaveFraSystem,
  ConnectorStatus,
  Maanedssammendrag,
  MvaStatusFraSystem,
  RegnskapConnector,
} from "@/types/connector";

type TripletexSessionSvar = {
  value?: {
    token: string;
    expiresAt: string;
  };
};

const BASE_URL = process.env.TRIPLETEX_BASE_URL ?? "https://tripletex.no/v2";

async function vent(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMedRetry(url: string, init: RequestInit, maksForsok = 4): Promise<Response> {
  let sisteFeil: unknown;

  for (let forsok = 0; forsok < maksForsok; forsok += 1) {
    try {
      const response = await fetch(url, init);
      if (response.ok) return response;
      if (response.status === 429 || response.status >= 500) {
        const backoff = 250 * 2 ** forsok;
        await vent(backoff);
        continue;
      }
      return response;
    } catch (error) {
      sisteFeil = error;
      const backoff = 250 * 2 ** forsok;
      await vent(backoff);
    }
  }

  throw sisteFeil ?? new Error("Ukjent feil mot Tripletex");
}

export class TripletexConnector implements RegnskapConnector {
  navn = "Tripletex";

  constructor(private tilkobling: SystemTilkobling) {}

  private async hentGyldigSessionToken(): Promise<string> {
    const naa = new Date();
    if (
      this.tilkobling.sessionTokenKryptert &&
      this.tilkobling.sessionTokenExpiresAt &&
      this.tilkobling.sessionTokenExpiresAt > new Date(naa.getTime() + 60_000)
    ) {
      return dekrypter(this.tilkobling.sessionTokenKryptert);
    }

    if (!this.tilkobling.consumerTokenKryptert || !this.tilkobling.employeeTokenKryptert) {
      throw new Error("Tripletex tokens mangler.");
    }

    const consumerToken = dekrypter(this.tilkobling.consumerTokenKryptert);
    const employeeToken = dekrypter(this.tilkobling.employeeTokenKryptert);

    const response = await fetchMedRetry(`${BASE_URL}/token/session/:create`, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${Buffer.from(`${consumerToken}:${employeeToken}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Kunne ikke opprette Tripletex sessionToken. HTTP ${response.status}`);
    }

    const data = (await response.json()) as TripletexSessionSvar;
    const token = data.value?.token;
    const expiresAt = data.value?.expiresAt;

    if (!token || !expiresAt) {
      throw new Error("Uventet svar ved opprettelse av sessionToken.");
    }

    await prisma.systemTilkobling.update({
      where: { id: this.tilkobling.id },
      data: {
        sessionTokenKryptert: krypter(token),
        sessionTokenExpiresAt: new Date(expiresAt),
        status: TilkoblingsStatus.TILKOBLET,
      },
    });

    this.tilkobling.sessionTokenKryptert = krypter(token);
    this.tilkobling.sessionTokenExpiresAt = new Date(expiresAt);
    return token;
  }

  async testTilkobling(): Promise<ConnectorStatus> {
    try {
      const token = await this.hentGyldigSessionToken();
      const response = await fetchMedRetry(`${BASE_URL}/company`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ok = response.ok;
      const melding = ok ? "Tilkobling verifisert." : `Tripletex svarte ${response.status}`;

      await prisma.systemTilkobling.update({
        where: { id: this.tilkobling.id },
        data: {
          sistTestetTidspunkt: new Date(),
          sistFeilmelding: ok ? null : melding,
          status: ok ? TilkoblingsStatus.TILKOBLET : TilkoblingsStatus.FEIL,
        },
      });

      return { ok, melding };
    } catch (error) {
      logger.error({ error }, "Tripletex testTilkobling feilet");
      await prisma.systemTilkobling.update({
        where: { id: this.tilkobling.id },
        data: {
          sistTestetTidspunkt: new Date(),
          sistFeilmelding: "Kunne ikke nå Tripletex",
          status: TilkoblingsStatus.FEIL,
        },
      });
      return { ok: false, melding: "Kunne ikke nå Tripletex" };
    }
  }

  async hentManglendeBilagOppgaver(): Promise<BilagsOppgaveFraSystem[]> {
    // TODO: Bytt ut med faktisk Tripletex-endepunkt for manglende bilag.
    return [
      {
        externalVoucherId: "TRX-1001",
        tittel: "Manglende bilag fra Tripletex",
        beskrivelse: "Automatisk oppdaget av connector.",
      },
    ];
  }

  async hentMaanedssammendrag(periode: string): Promise<Maanedssammendrag> {
    // TODO: Bruk Tripletex finans-endepunkt ved produksjonssetting.
    return {
      periode,
      omsetning: 320000,
      kostnader: 185000,
      resultat: 135000,
      toppKostnader: [
        { navn: "Lønn", belop: 98000 },
        { navn: "Leie", belop: 32000 },
        { navn: "Programvare", belop: 14000 },
      ],
    };
  }

  async hentMvaStatus(periode: string): Promise<MvaStatusFraSystem> {
    // TODO: Hent faktisk MVA-status fra Tripletex når endpoint er avklart.
    return {
      periode,
      status: "PAGAR",
    };
  }
}

export async function opprettTripletexTilkobling(params: {
  kundeselskapId: string;
  consumerToken: string;
  employeeToken: string;
}) {
  return prisma.systemTilkobling.upsert({
    where: {
      id: `${params.kundeselskapId}-tripletex`,
    },
    update: {
      type: TilkoblingsType.TRIPLETEX,
      consumerTokenKryptert: krypter(params.consumerToken),
      employeeTokenKryptert: krypter(params.employeeToken),
      status: TilkoblingsStatus.IKKE_TILKOBLET,
      deaktivertTidspunkt: null,
    },
    create: {
      id: `${params.kundeselskapId}-tripletex`,
      kundeselskapId: params.kundeselskapId,
      type: TilkoblingsType.TRIPLETEX,
      consumerTokenKryptert: krypter(params.consumerToken),
      employeeTokenKryptert: krypter(params.employeeToken),
      status: TilkoblingsStatus.IKKE_TILKOBLET,
    },
  });
}
