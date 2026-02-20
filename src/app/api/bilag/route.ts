import { OppgaveStatus, Rolle } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { krevApiRoller } from "@/lib/auth/api";
import { prisma } from "@/lib/db/prisma";
import { skrivAuditlogg } from "@/lib/services/auditlogg";
import { validerCsrfToken } from "@/lib/sikkerhet/csrf";

export async function GET() {
  const resultat = await krevApiRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER, Rolle.KUNDE]);
  if ("feil" in resultat) return resultat.feil;

  const { bruker } = resultat;
  const where = bruker.rolle === Rolle.KUNDE ? { kundeselskapId: bruker.kundeselskapId ?? "" } : {};

  const oppgaver = await prisma.bilagsOppgave.findMany({
    where,
    orderBy: { opprettetTidspunkt: "desc" },
  });

  return NextResponse.json({ oppgaver });
}

const opprettSchema = z.object({
  kundeselskapId: z.string().min(1),
  tittel: z.string().min(2),
  beskrivelse: z.string().optional(),
  externalVoucherId: z.string().optional(),
  forfallsdato: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const csrfOk = await validerCsrfToken(request);
  if (!csrfOk) {
    return NextResponse.json({ feil: "Ugyldig CSRF-token" }, { status: 403 });
  }

  const resultat = await krevApiRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER]);
  if ("feil" in resultat) return resultat.feil;

  const body = await request.json();
  const parsed = opprettSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ feil: parsed.error.flatten() }, { status: 400 });
  }

  const oppgave = await prisma.bilagsOppgave.create({
    data: {
      kundeselskapId: parsed.data.kundeselskapId,
      opprettetAvId: resultat.bruker.id,
      tittel: parsed.data.tittel,
      beskrivelse: parsed.data.beskrivelse,
      externalVoucherId: parsed.data.externalVoucherId,
      status: OppgaveStatus.APEN,
      forfallsdato: parsed.data.forfallsdato ? new Date(parsed.data.forfallsdato) : null,
    },
  });

  await skrivAuditlogg({
    organisasjonId: resultat.bruker.organisasjonId,
    kundeselskapId: oppgave.kundeselskapId,
    brukerId: resultat.bruker.id,
    handling: "BILAGSOPPGAVE_OPPRETTET",
    ressursType: "BilagsOppgave",
    ressursId: oppgave.id,
  });

  return NextResponse.json({ oppgave }, { status: 201 });
}
