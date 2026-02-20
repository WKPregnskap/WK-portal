import { NextResponse } from "next/server";
import { hentEllerLagCsrfToken } from "@/lib/sikkerhet/csrf";

export async function GET() {
  const token = await hentEllerLagCsrfToken();
  return NextResponse.json({ token });
}
