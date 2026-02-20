import { PortalLayout } from "@/components/layout/portal-layout";
import { Kort, KortInnhold, KortTittel } from "@/components/ui/kort";
import { krevInnloggetBruker } from "@/lib/auth/tilgang";
import { prisma } from "@/lib/db/prisma";

export default async function MeldingerSide() {
  const bruker = await krevInnloggetBruker();
  const kundeselskapId = bruker.kundeselskapId ?? (await prisma.kundeselskap.findFirst())?.id;

  const trader = kundeselskapId
    ? await prisma.meldingsTrad.findMany({
        where: { kundeselskapId },
        include: { meldinger: { orderBy: { opprettetTidspunkt: "desc" }, take: 1 } },
        orderBy: { oppdatertTidspunkt: "desc" },
      })
    : [];

  return (
    <PortalLayout navn={bruker.navn} rolle={bruker.rolle}>
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Meldinger</h1>
        <p className="text-sm text-slate-600">Portalbasert kommunikasjon som erstatter e-post.</p>
      </div>

      <div className="space-y-3">
        {trader.map((trad) => (
          <Kort key={trad.id}>
            <KortInnhold>
              <KortTittel>{trad.emne}</KortTittel>
              <p className="mt-2 text-sm text-slate-700">{trad.meldinger[0]?.innhold ?? "Ingen meldinger ennå"}</p>
            </KortInnhold>
          </Kort>
        ))}
      </div>
    </PortalLayout>
  );
}
