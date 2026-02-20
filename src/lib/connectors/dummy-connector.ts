import {
  BilagsOppgaveFraSystem,
  ConnectorStatus,
  Maanedssammendrag,
  MvaStatusFraSystem,
  RegnskapConnector,
} from "@/types/connector";

export class DummyConnector implements RegnskapConnector {
  navn = "DummyConnector";

  async testTilkobling(): Promise<ConnectorStatus> {
    return { ok: true, melding: "Dummy-tilkobling aktiv" };
  }

  async hentManglendeBilagOppgaver(): Promise<BilagsOppgaveFraSystem[]> {
    return [
      {
        externalVoucherId: "DUMMY-1001",
        tittel: "Manglende kvittering (demo)",
        beskrivelse: "Demooppgave fra lokal fallback.",
      },
    ];
  }

  async hentMaanedssammendrag(periode: string): Promise<Maanedssammendrag> {
    return {
      periode,
      omsetning: 275000,
      kostnader: 163000,
      resultat: 112000,
      toppKostnader: [
        { navn: "Varekjøp", belop: 74000 },
        { navn: "Lønn", belop: 62000 },
        { navn: "Transport", belop: 18000 },
      ],
    };
  }

  async hentMvaStatus(periode: string): Promise<MvaStatusFraSystem> {
    return {
      periode,
      status: "IKKE_STARTET",
    };
  }
}
