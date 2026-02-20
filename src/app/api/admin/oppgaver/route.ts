import { Rolle } from "@prisma/client";
import { NextResponse } from "next/server";
import { krevApiRoller } from "@/lib/auth/api";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const resultat = await krevApiRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER]);
  if ("feil" in resultat) return resultat.feil;

  const oppgaver = await prisma.bilagsOppgave.findMany({
    include: { kundeselskap: true },
    orderBy: { opprettetTidspunkt: "desc" },
  });

  return NextResponse.json({ oppgaver });
}
