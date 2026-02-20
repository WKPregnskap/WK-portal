import { OppgaveStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { hentConnector } from "@/lib/connectors/fabrikk";

export async function synkManglendeBilag(kundeselskapId: string, opprettetAvId: string) {
  const connector = await hentConnector(kundeselskapId);
  const oppgaver = await connector.hentManglendeBilagOppgaver();

  for (const oppgave of oppgaver) {
    await prisma.bilagsOppgave.upsert({
      where: {
        id: `${kundeselskapId}-${oppgave.externalVoucherId}`,
      },
      update: {
        tittel: oppgave.tittel,
        beskrivelse: oppgave.beskrivelse,
      },
      create: {
        id: `${kundeselskapId}-${oppgave.externalVoucherId}`,
        kundeselskapId,
        opprettetAvId,
        tittel: oppgave.tittel,
        beskrivelse: oppgave.beskrivelse,
        externalVoucherId: oppgave.externalVoucherId,
        status: OppgaveStatus.APEN,
      },
    });
  }

  return oppgaver.length;
}
