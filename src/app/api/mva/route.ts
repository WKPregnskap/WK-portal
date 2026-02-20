import { Rolle } from "@prisma/client";
import { NextResponse } from "next/server";
import { krevApiRoller } from "@/lib/auth/api";
import { prisma } from "@/lib/db/prisma";
import { hentConnector } from "@/lib/connectors/fabrikk";

export async function GET(request: Request) {
  const resultat = await krevApiRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER, Rolle.KUNDE]);
  if ("feil" in resultat) return resultat.feil;

  const url = new URL(request.url);
  const periode = url.searchParams.get("periode") ?? nyestePeriode();

  const kundeselskapId =
    resultat.bruker.rolle === Rolle.KUNDE
      ? resultat.bruker.kundeselskapId
      : url.searchParams.get("kundeselskapId") ??
        (await prisma.kundeselskap.findFirst({ where: { organisasjonId: resultat.bruker.organisasjonId } }))?.id;

  if (!kundeselskapId) {
    return NextResponse.json({ feil: "Mangler kundeselskap" }, { status: 400 });
  }

  const connector = await hentConnector(kundeselskapId);
  const statusFraSystem = await connector.hentMvaStatus(periode);

  const mva = await prisma.mvaPeriodeStatus.upsert({
    where: {
      kundeselskapId_periode: {
        kundeselskapId,
        periode,
      },
    },
    update: {
      status: statusFraSystem.status,
      rapportertDato: statusFraSystem.rapportertDato ? new Date(statusFraSystem.rapportertDato) : null,
      referanse: statusFraSystem.referanse,
    },
    create: {
      kundeselskapId,
      periode,
      status: statusFraSystem.status,
      rapportertDato: statusFraSystem.rapportertDato ? new Date(statusFraSystem.rapportertDato) : null,
      referanse: statusFraSystem.referanse,
    },
  });

  return NextResponse.json({ mva });
}

function nyestePeriode() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
