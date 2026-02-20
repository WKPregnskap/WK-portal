import { getServerSession } from "next-auth";
import { Rolle } from "@prisma/client";
import { authOptions } from "@/lib/auth/konfigurasjon";

export async function hentServerSession() {
  return getServerSession(authOptions);
}

export async function krevInnlogging() {
  const session = await hentServerSession();
  if (!session?.user) {
    throw new Error("IKKE_INNLOGGET");
  }
  return session.user;
}

export async function krevRolle(tillatt: Rolle[]) {
  const bruker = await krevInnlogging();
  if (!tillatt.includes(bruker.rolle)) {
    throw new Error("MANGELENDE_TILGANG");
  }
  return bruker;
}
