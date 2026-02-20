import { OppgaveStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Kort, KortInnhold } from "@/components/ui/kort";
import { PortalLayout } from "@/components/layout/portal-layout";
import { krevInnloggetBruker } from "@/lib/auth/tilgang";
import { prisma } from "@/lib/db/prisma";

const statusFarge: Record<OppgaveStatus, string> = {
  APEN: "bg-amber-100 text-amber-800 border-amber-200",
  OPPLASTET: "bg-sky-100 text-sky-800 border-sky-200",
  LINKET: "bg-indigo-100 text-indigo-800 border-indigo-200",
  FERDIG: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export default async function BilagSide() {
  const bruker = await krevInnloggetBruker();
  const kundeselskapId = bruker.kundeselskapId ?? (await prisma.kundeselskap.findFirst())?.id;

  const oppgaver = kundeselskapId
    ? await prisma.bilagsOppgave.findMany({
        where: {
          kundeselskapId,
        },
        orderBy: { opprettetTidspunkt: "desc" },
      })
    : [];

  return (
    <PortalLayout navn={bruker.navn} rolle={bruker.rolle}>
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Manglende bilag</h1>
        <p className="text-sm text-slate-600">Statusflyt: ÅPEN → OPPLASTET → LINKET → FERDIG</p>
      </div>

      <div className="space-y-3">
        {oppgaver.map((oppgave) => (
          <Kort key={oppgave.id}>
            <KortInnhold className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{oppgave.tittel}</h2>
                  <p className="text-sm text-slate-600">{oppgave.beskrivelse}</p>
                </div>
                <Badge className={statusFarge[oppgave.status]}>{oppgave.status}</Badge>
              </div>
              <p className="text-xs text-slate-500">Voucher-ID: {oppgave.externalVoucherId ?? "-"}</p>
            </KortInnhold>
          </Kort>
        ))}
      </div>
    </PortalLayout>
  );
}
