import { TilkoblingsType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { DummyConnector } from "@/lib/connectors/dummy-connector";
import { TripletexConnector } from "@/lib/connectors/tripletex-connector";

export async function hentConnector(kundeselskapId: string) {
  const tilkobling = await prisma.systemTilkobling.findFirst({
    where: {
      kundeselskapId,
      deaktivertTidspunkt: null,
    },
    orderBy: { opprettetTidspunkt: "desc" },
  });

  if (!tilkobling) {
    return new DummyConnector();
  }

  if (tilkobling.type === TilkoblingsType.TRIPLETEX) {
    return new TripletexConnector(tilkobling);
  }

  return new DummyConnector();
}
