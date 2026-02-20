import { Rolle } from "@prisma/client";
import { PortalLayout } from "@/components/layout/portal-layout";
import { Badge } from "@/components/ui/badge";
import { Kort, KortInnhold } from "@/components/ui/kort";
import { krevRoller } from "@/lib/auth/tilgang";
import { prisma } from "@/lib/db/prisma";

export default async function AdminSystemTilkoblingerSide() {
  const bruker = await krevRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER]);
  const tilkoblinger = await prisma.systemTilkobling.findMany({
    include: { kundeselskap: true },
    orderBy: { opprettetTidspunkt: "desc" },
  });

  return (
    <PortalLayout navn={bruker.navn} rolle={bruker.rolle}>
      <div>
        <h1 className="text-3xl font-semibold">Systemtilkoblinger</h1>
        <p className="text-sm text-slate-600">Koble Tripletex, test tilkobling og roter/deaktiver tokens.</p>
      </div>

      <div className="space-y-3">
        {tilkoblinger.map((tilkobling) => (
          <Kort key={tilkobling.id}>
            <KortInnhold className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{tilkobling.kundeselskap.navn}</p>
                <p className="text-sm text-slate-600">{tilkobling.type}</p>
                <p className="text-sm text-slate-600">Sist testet: {tilkobling.sistTestetTidspunkt?.toLocaleString("nb-NO") ?? "-"}</p>
              </div>
              <Badge>{tilkobling.status}</Badge>
            </KortInnhold>
          </Kort>
        ))}
      </div>
    </PortalLayout>
  );
}
