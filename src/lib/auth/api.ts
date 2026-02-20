import { NextResponse } from "next/server";
import { Rolle } from "@prisma/client";
import { hentServerSession } from "@/lib/auth/session";

export async function hentApiBruker() {
  const session = await hentServerSession();
  return session?.user ?? null;
}

export async function krevApiRoller(tillatteRoller: Rolle[]) {
  const bruker = await hentApiBruker();
  if (!bruker) {
    return { feil: NextResponse.json({ feil: "Ikke innlogget" }, { status: 401 }) };
  }

  if (!tillatteRoller.includes(bruker.rolle)) {
    return { feil: NextResponse.json({ feil: "Ingen tilgang" }, { status: 403 }) };
  }

  return { bruker };
}
