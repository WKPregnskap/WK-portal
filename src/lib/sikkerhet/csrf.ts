import crypto from "crypto";
import { cookies } from "next/headers";

const CSRF_COOKIE = "wk_csrf";
const CSRF_HEADER = "x-csrf-token";

export async function hentEllerLagCsrfToken() {
  const cookieStore = await cookies();
  const eksisterende = cookieStore.get(CSRF_COOKIE)?.value;
  if (eksisterende) return eksisterende;

  const ny = crypto.randomBytes(24).toString("base64url");
  cookieStore.set(CSRF_COOKIE, ny, {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return ny;
}

export async function validerCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);
  return Boolean(cookieToken && headerToken && cookieToken === headerToken);
}
