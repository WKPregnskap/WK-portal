import { Rolle } from "@prisma/client";
import { PortalLayout } from "@/components/layout/portal-layout";
import { Kort, KortInnhold } from "@/components/ui/kort";
import { krevRoller } from "@/lib/auth/tilgang";
import { prisma } from "@/lib/db/prisma";

export default async function AdminKunderSide() {
  const bruker = await krevRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER]);

  const kunder = await prisma.kundeselskap.findMany({
    where: { organisasjonId: bruker.organisasjonId },
    include: {
      _count: { select: { brukere: true, bilagsOppgaver: true } },
    },
    orderBy: { navn: "asc" },
  });

  return (
    <PortalLayout navn={bruker.navn} rolle={bruker.rolle}>
      <div>
        <h1 className="text-3xl font-semibold">Kundeadministrasjon</h1>
        <p className="text-sm text-slate-600">Opprett kundeselskap og kunde-brukere via API-endepunkter.</p>
      </div>
      <div className="space-y-3">
        {kunder.map((kunde) => (
          <Kort key={kunde.id}>
            <KortInnhold>
              <p className="font-semibold">{kunde.navn}</p>
              <p className="text-sm text-slate-600">Org.nr: {kunde.orgnummer}</p>
              <p className="text-sm text-slate-600">
                Brukere: {kunde._count.brukere} · Oppgaver: {kunde._count.bilagsOppgaver}
              </p>
            </KortInnhold>
          </Kort>
        ))}
      </div>
    </PortalLayout>
  );
}
