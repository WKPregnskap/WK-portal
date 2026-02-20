import { Rolle } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { krevApiRoller } from "@/lib/auth/api";
import { prisma } from "@/lib/db/prisma";
import { validerCsrfToken } from "@/lib/sikkerhet/csrf";

export async function GET() {
  const resultat = await krevApiRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER, Rolle.KUNDE]);
  if ("feil" in resultat) return resultat.feil;

  const where =
    resultat.bruker.rolle === Rolle.KUNDE
      ? { kundeselskapId: resultat.bruker.kundeselskapId ?? "" }
      : { organisasjonId: resultat.bruker.organisasjonId };

  const trader = await prisma.meldingsTrad.findMany({
    where: "organisasjonId" in where ? { kundeselskap: where } : where,
    include: { meldinger: true },
    orderBy: { oppdatertTidspunkt: "desc" },
  });

  return NextResponse.json({ trader });
}

const tradSchema = z.object({
  kundeselskapId: z.string().min(1),
  emne: z.string().min(2),
});

export async function POST(request: Request) {
  const csrfOk = await validerCsrfToken(request);
  if (!csrfOk) {
    return NextResponse.json({ feil: "Ugyldig CSRF-token" }, { status: 403 });
  }

  const resultat = await krevApiRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER]);
  if ("feil" in resultat) return resultat.feil;

  const body = await request.json();
  const parsed = tradSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ feil: parsed.error.flatten() }, { status: 400 });
  }

  const trad = await prisma.meldingsTrad.create({
    data: {
      kundeselskapId: parsed.data.kundeselskapId,
      emne: parsed.data.emne,
    },
  });

  return NextResponse.json({ trad }, { status: 201 });
}
