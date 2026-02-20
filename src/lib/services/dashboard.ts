import { prisma } from "@/lib/db/prisma";
import { hentConnector } from "@/lib/connectors/fabrikk";

export async function oppdaterDashboardCache(kundeselskapId: string, periode: string) {
  const connector = await hentConnector(kundeselskapId);
  const sammendrag = await connector.hentMaanedssammendrag(periode);

  await prisma.dashboardCache.upsert({
    where: {
      kundeselskapId_periode: {
        kundeselskapId,
        periode,
      },
    },
    update: {
      payloadJson: sammendrag,
    },
    create: {
      kundeselskapId,
      periode,
      payloadJson: sammendrag,
    },
  });

  return sammendrag;
}
