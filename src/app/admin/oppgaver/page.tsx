import { Rolle } from "@prisma/client";
import { PortalLayout } from "@/components/layout/portal-layout";
import { Badge } from "@/components/ui/badge";
import { Kort, KortInnhold } from "@/components/ui/kort";
import { krevRoller } from "@/lib/auth/tilgang";
import { prisma } from "@/lib/db/prisma";

export default async function AdminOppgaverSide() {
  const bruker = await krevRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER]);

  const oppgaver = await prisma.bilagsOppgave.findMany({
    include: { kundeselskap: true },
    orderBy: { opprettetTidspunkt: "desc" },
  });

  return (
    <PortalLayout navn={bruker.navn} rolle={bruker.rolle}>
      <div>
        <h1 className="text-3xl font-semibold">Oppgaveoversikt</h1>
        <p className="text-sm text-slate-600">Tverrkundeoversikt over manglende bilag.</p>
      </div>

      <div className="space-y-3">
        {oppgaver.map((oppgave) => (
          <Kort key={oppgave.id}>
            <KortInnhold className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{oppgave.tittel}</p>
                <p className="text-sm text-slate-600">{oppgave.kundeselskap.navn}</p>
                <p className="text-sm text-slate-600">Voucher-ID: {oppgave.externalVoucherId ?? "-"}</p>
              </div>
              <Badge>{oppgave.status}</Badge>
            </KortInnhold>
          </Kort>
        ))}
      </div>
    </PortalLayout>
  );
}
