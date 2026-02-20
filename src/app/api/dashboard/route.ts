import { Rolle } from "@prisma/client";
import { NextResponse } from "next/server";
import { krevApiRoller } from "@/lib/auth/api";
import { prisma } from "@/lib/db/prisma";
import { oppdaterDashboardCache } from "@/lib/services/dashboard";

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

  const data = await oppdaterDashboardCache(kundeselskapId, periode);
  return NextResponse.json({ data });
}

function nyestePeriode() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
