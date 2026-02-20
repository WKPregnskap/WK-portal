import bcrypt from "bcryptjs";
import { Rolle } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { krevApiRoller } from "@/lib/auth/api";
import { prisma } from "@/lib/db/prisma";
import { skrivAuditlogg } from "@/lib/services/auditlogg";
import { validerCsrfToken } from "@/lib/sikkerhet/csrf";

const schema = z.object({
  navn: z.string().min(2),
  orgnummer: z.string().min(9),
  kundeNavn: z.string().min(2),
  kundeEpost: z.string().email(),
  kundePassord: z.string().min(8),
});

export async function POST(request: Request) {
  const csrfOk = await validerCsrfToken(request);
  if (!csrfOk) return NextResponse.json({ feil: "Ugyldig CSRF-token" }, { status: 403 });

  const resultat = await krevApiRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER]);
  if ("feil" in resultat) return resultat.feil;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ feil: parsed.error.flatten() }, { status: 400 });
  }

  const kundeselskap = await prisma.kundeselskap.create({
    data: {
      organisasjonId: resultat.bruker.organisasjonId,
      navn: parsed.data.navn,
      orgnummer: parsed.data.orgnummer,
    },
  });

  const passordHash = await bcrypt.hash(parsed.data.kundePassord, 10);

  const kundeBruker = await prisma.bruker.create({
    data: {
      organisasjonId: resultat.bruker.organisasjonId,
      kundeselskapId: kundeselskap.id,
      navn: parsed.data.kundeNavn,
      epost: parsed.data.kundeEpost,
      passordHash,
      rolle: Rolle.KUNDE,
    },
  });

  await skrivAuditlogg({
    organisasjonId: resultat.bruker.organisasjonId,
    kundeselskapId: kundeselskap.id,
    brukerId: resultat.bruker.id,
    handling: "KUNDESKAP_OPPRETTET",
    ressursType: "Kundeselskap",
    ressursId: kundeselskap.id,
    metadata: { kundeBrukerId: kundeBruker.id },
  });

  return NextResponse.json({ kundeselskap, kundeBruker }, { status: 201 });
}
