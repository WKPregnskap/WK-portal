import { NextResponse } from "next/server";
import { logger } from "@/lib/logging/logger";

function validerSignatur(headers: Headers, payload: string) {
  const signatur = headers.get("x-tripletex-signatur");
  const hemmelig = process.env.TRIPLETEX_WEBHOOK_HEMMELIG;

  if (!hemmelig) {
    // TODO: I produksjon skal webhook alltid bruke signaturverifisering.
    return true;
  }

  // TODO: Implementer HMAC-sammenligning med timing-safe compare.
  return Boolean(signatur && payload);
}

export async function POST(request: Request) {
  const payload = await request.text();
  if (!validerSignatur(request.headers, payload)) {
    return NextResponse.json({ feil: "Ugyldig signatur" }, { status: 401 });
  }

  logger.info({ payload }, "Tripletex webhook mottatt");
  return NextResponse.json({ ok: true });
}
