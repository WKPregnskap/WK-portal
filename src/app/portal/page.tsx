import { Rolle } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Kort, KortInnhold, KortTittel } from "@/components/ui/kort";
import { PortalLayout } from "@/components/layout/portal-layout";
import { krevInnloggetBruker } from "@/lib/auth/tilgang";
import { prisma } from "@/lib/db/prisma";
import { oppdaterDashboardCache } from "@/lib/services/dashboard";

function hentPeriode() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function DashboardSide() {
  const bruker = await krevInnloggetBruker();
  const periode = hentPeriode();

  const kundeselskapId =
    bruker.rolle === Rolle.KUNDE
      ? bruker.kundeselskapId
      : (await prisma.kundeselskap.findFirst({ where: { organisasjonId: bruker.organisasjonId } }))?.id;

  const sammendrag = kundeselskapId ? await oppdaterDashboardCache(kundeselskapId, periode) : null;

  const tilkobling = kundeselskapId
    ? await prisma.systemTilkobling.findFirst({ where: { kundeselskapId, deaktivertTidspunkt: null } })
    : null;

  return (
    <PortalLayout navn={bruker.navn} rolle={bruker.rolle}>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Månedlig oversikt</h1>
          <p className="text-sm text-slate-600">Periode {periode}</p>
        </div>
        <Badge>{tilkobling ? "Tilkoblet" : "Ikke tilkoblet"}</Badge>
      </div>

      {!sammendrag ? (
        <Kort>
          <KortInnhold>
            <p>Ingen kundeselskap koblet til brukeren.</p>
          </KortInnhold>
        </Kort>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Kort>
              <KortInnhold>
                <p className="text-sm text-slate-500">Omsetning</p>
                <p className="text-2xl font-semibold">{sammendrag.omsetning.toLocaleString("nb-NO")} kr</p>
              </KortInnhold>
            </Kort>
            <Kort>
              <KortInnhold>
                <p className="text-sm text-slate-500">Kostnader</p>
                <p className="text-2xl font-semibold">{sammendrag.kostnader.toLocaleString("nb-NO")} kr</p>
              </KortInnhold>
            </Kort>
            <Kort>
              <KortInnhold>
                <p className="text-sm text-slate-500">Resultat</p>
                <p className="text-2xl font-semibold">{sammendrag.resultat.toLocaleString("nb-NO")} kr</p>
              </KortInnhold>
            </Kort>
          </div>

          <Kort>
            <KortInnhold>
              <KortTittel>Topp kostnader</KortTittel>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {sammendrag.toppKostnader.map((post) => (
                  <li className="flex justify-between" key={post.navn}>
                    <span>{post.navn}</span>
                    <span>{post.belop.toLocaleString("nb-NO")} kr</span>
                  </li>
                ))}
              </ul>
            </KortInnhold>
          </Kort>
        </>
      )}
    </PortalLayout>
  );
}
