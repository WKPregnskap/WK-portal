import { Rolle } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { krevApiRoller } from "@/lib/auth/api";
import { prisma } from "@/lib/db/prisma";
import { validerCsrfToken } from "@/lib/sikkerhet/csrf";

const meldingSchema = z.object({
  innhold: z.string().min(1),
  intern: z.boolean().optional(),
});

export async function POST(request: Request, context: { params: Promise<{ tradId: string }> }) {
  const csrfOk = await validerCsrfToken(request);
  if (!csrfOk) {
    return NextResponse.json({ feil: "Ugyldig CSRF-token" }, { status: 403 });
  }

  const resultat = await krevApiRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER, Rolle.KUNDE]);
  if ("feil" in resultat) return resultat.feil;

  const body = await request.json();
  const parsed = meldingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ feil: parsed.error.flatten() }, { status: 400 });
  }

  const { tradId } = await context.params;
  const trad = await prisma.meldingsTrad.findUnique({ where: { id: tradId } });

  if (!trad) {
    return NextResponse.json({ feil: "Tråd finnes ikke" }, { status: 404 });
  }

  if (resultat.bruker.rolle === Rolle.KUNDE && trad.kundeselskapId !== resultat.bruker.kundeselskapId) {
    return NextResponse.json({ feil: "Ingen tilgang" }, { status: 403 });
  }

  const melding = await prisma.melding.create({
    data: {
      meldingsTradId: tradId,
      avsenderId: resultat.bruker.id,
      innhold: parsed.data.innhold,
      intern: parsed.data.intern ?? false,
    },
  });

  return NextResponse.json({ melding }, { status: 201 });
}
