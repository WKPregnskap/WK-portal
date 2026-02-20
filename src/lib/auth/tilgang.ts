import { Rolle } from "@prisma/client";
import { redirect } from "next/navigation";
import { hentServerSession } from "@/lib/auth/session";

export async function krevInnloggetBruker() {
  const session = await hentServerSession();
  if (!session?.user) {
    redirect("/innlogging");
  }
  return session.user;
}

export async function krevRoller(roller: Rolle[]) {
  const bruker = await krevInnloggetBruker();
  if (!roller.includes(bruker.rolle)) {
    redirect("/portal");
  }
  return bruker;
}
