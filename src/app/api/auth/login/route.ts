import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { appendSessionCookie } from "@/lib/auth/session";
import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const p = Body.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: p.data.email } });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const ok = await verifyPassword(p.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const res = NextResponse.json({ ok: true, role: user.role });
  await appendSessionCookie(res, { sub: user.id, email: user.email, role: user.role });
  return res;
}
