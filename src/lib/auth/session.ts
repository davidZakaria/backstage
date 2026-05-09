import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

const COOKIE = "session";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

/**
 * Only use Secure cookies when the public URL is https://, or when forced.
 * Do NOT fall back to NODE_ENV === "production" — many VPS installs use plain http://IP:8080
 * without setting NEXT_PUBLIC_SITE_URL; Secure cookies are then dropped and admin login loops.
 */
function cookieSecure(): boolean {
  const o = process.env.AUTH_COOKIE_SECURE;
  if (o === "false" || o === "0") return false;
  if (o === "true" || o === "1") return true;
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  return site.startsWith("https://");
}

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieSecure(),
    path: "/",
    maxAge,
  };
}

function getSecret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET must be set (min 16 chars)");
  }
  return new TextEncoder().encode(s);
}

export type SessionPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

async function mintSessionJwt(payload: SessionPayload, maxAgeSec: number): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec}s`)
    .sign(getSecret());
}

/** Prefer in Route Handlers: Set-Cookie is applied to the same Response as the JSON body. */
export async function appendSessionCookie(
  res: NextResponse,
  payload: SessionPayload,
  maxAgeSec = SESSION_MAX_AGE_SEC,
) {
  const token = await mintSessionJwt(payload, maxAgeSec);
  res.cookies.set(COOKIE, token, sessionCookieOptions(maxAgeSec));
  return res;
}

export async function signSession(payload: SessionPayload, maxAgeSec = SESSION_MAX_AGE_SEC) {
  const token = await mintSessionJwt(payload, maxAgeSec);
  const store = await cookies();
  store.set(COOKIE, token, sessionCookieOptions(maxAgeSec));
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    const email = payload.email as string | undefined;
    const role = payload.role as UserRole | undefined;
    if (!sub || !email || !role) return null;
    return { sub, email, role };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s || s.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized");
  }
  return s;
}

export async function requireUser() {
  const s = await getSession();
  if (!s) throw new Error("Unauthorized");
  return s;
}
