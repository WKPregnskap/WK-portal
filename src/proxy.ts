import { NextRequest, NextResponse } from "next/server";
import { sjekkRateLimit } from "@/lib/sikkerhet/rate-limit";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === "/api/auth/callback/credentials" || path === "/api/upload") {
    const ip = request.headers.get("x-forwarded-for") ?? "lokal";
    const nokkel = `${path}:${ip}`;
    const limit = sjekkRateLimit(nokkel, 10, 60_000);

    if (!limit.tillatt) {
      return NextResponse.json({ feil: "For mange forespørsler" }, { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
