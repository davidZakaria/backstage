import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";

const COOKIE = "session";

/** Browsers do not send Secure cookies on http:// (except some localhost cases). IP:8080 HTTP + NODE_ENV=production would otherwise “log in” but instantly lose the session. */
function cookieSecure(): boolean {
  const o = process.env.AUTH_COOKIE_SECURE;
  if (o === "false" || o === "0") return false;
  if (o === "true" || o === "1") return true;
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (site.startsWith("http://")) return false;
  if (site.startsWith("https://")) return true;
  return process.env.NODE_ENV === "production";
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

export async function signSession(payload: SessionPayload, maxAgeSec = 60 * 60 * 24 * 7) {
  const token = await new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec}s`)
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    maxAge: maxAgeSec,
  });
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
