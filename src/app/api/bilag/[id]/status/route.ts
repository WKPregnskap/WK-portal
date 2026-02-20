import { OppgaveStatus, Rolle } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { krevApiRoller } from "@/lib/auth/api";
import { prisma } from "@/lib/db/prisma";
import { skrivAuditlogg } from "@/lib/services/auditlogg";
import { validerCsrfToken } from "@/lib/sikkerhet/csrf";

const statusSchema = z.object({
  status: z.nativeEnum(OppgaveStatus),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const csrfOk = await validerCsrfToken(request);
  if (!csrfOk) {
    return NextResponse.json({ feil: "Ugyldig CSRF-token" }, { status: 403 });
  }

  const resultat = await krevApiRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER, Rolle.KUNDE]);
  if ("feil" in resultat) return resultat.feil;

  const body = await request.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ feil: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await context.params;
  const eksisterende = await prisma.bilagsOppgave.findUnique({ where: { id } });
  if (!eksisterende) {
    return NextResponse.json({ feil: "Oppgave finnes ikke" }, { status: 404 });
  }

  if (resultat.bruker.rolle === Rolle.KUNDE && eksisterende.kundeselskapId !== resultat.bruker.kundeselskapId) {
    return NextResponse.json({ feil: "Ingen tilgang" }, { status: 403 });
  }

  const oppgave = await prisma.bilagsOppgave.update({
    where: { id },
    data: {
      status: parsed.data.status,
    },
  });

  await skrivAuditlogg({
    organisasjonId: resultat.bruker.organisasjonId,
    kundeselskapId: oppgave.kundeselskapId,
    brukerId: resultat.bruker.id,
    handling: "BILAGSOPPGAVE_STATUS_ENDRET",
    ressursType: "BilagsOppgave",
    ressursId: oppgave.id,
    metadata: { status: parsed.data.status },
  });

  return NextResponse.json({ oppgave });
}
