import { Rolle } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { krevApiRoller } from "@/lib/auth/api";
import { leggTilJobb } from "@/lib/queues/jobber";
import { validerCsrfToken } from "@/lib/sikkerhet/csrf";

const schema = z.object({
  jobb: z.enum(["oppdater-dashboard-cache", "synk-manglende-bilag", "forny-tripletex-session"]),
  kundeselskapId: z.string().min(1),
  periode: z.string().optional(),
});

export async function POST(request: Request) {
  const csrfOk = await validerCsrfToken(request);
  if (!csrfOk) return NextResponse.json({ feil: "Ugyldig CSRF-token" }, { status: 403 });

  const resultat = await krevApiRoller([Rolle.ADMIN, Rolle.REGNSKAPSFORER]);
  if ("feil" in resultat) return resultat.feil;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ feil: parsed.error.flatten() }, { status: 400 });
  }

  await leggTilJobb(parsed.data.jobb, {
    kundeselskapId: parsed.data.kundeselskapId,
    periode: parsed.data.periode,
    opprettetAvId: resultat.bruker.id,
  });

  return NextResponse.json({ ok: true });
}
