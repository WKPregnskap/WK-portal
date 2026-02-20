import { PortalLayout } from "@/components/layout/portal-layout";
import { Badge } from "@/components/ui/badge";
import { Kort, KortInnhold } from "@/components/ui/kort";
import { krevInnloggetBruker } from "@/lib/auth/tilgang";
import { prisma } from "@/lib/db/prisma";

export default async function MvaSide() {
  const bruker = await krevInnloggetBruker();
  const kundeselskapId = bruker.kundeselskapId ?? (await prisma.kundeselskap.findFirst())?.id;

  const perioder = kundeselskapId
    ? await prisma.mvaPeriodeStatus.findMany({
        where: { kundeselskapId },
        orderBy: { periode: "desc" },
      })
    : [];

  return (
    <PortalLayout navn={bruker.navn} rolle={bruker.rolle}>
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">MVA-status</h1>
        <p className="text-sm text-slate-600">Oversikt over periode, status og referanse.</p>
      </div>

      <div className="space-y-3">
        {perioder.length === 0 ? (
          <Kort>
            <KortInnhold>
              <p className="text-sm text-slate-600">Ingen MVA-perioder registrert enda.</p>
            </KortInnhold>
          </Kort>
        ) : null}
        {perioder.map((periode) => (
          <Kort key={periode.id}>
            <KortInnhold className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{periode.periode}</p>
                <p className="text-sm text-slate-600">
                  Rapportert dato: {periode.rapportertDato ? periode.rapportertDato.toLocaleDateString("nb-NO") : "-"}
                </p>
                <p className="text-sm text-slate-600">Referanse: {periode.referanse ?? "-"}</p>
              </div>
              <Badge>{periode.status}</Badge>
            </KortInnhold>
          </Kort>
        ))}
      </div>
    </PortalLayout>
  );
}
