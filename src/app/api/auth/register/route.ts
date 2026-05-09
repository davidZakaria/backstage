import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const p = Body.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const exists = await prisma.user.findUnique({ where: { email: p.data.email } });
  if (exists) return NextResponse.json({ error: "Email in use" }, { status: 409 });
  const passwordHash = await hashPassword(p.data.password);
  const user = await prisma.user.create({
    data: {
      email: p.data.email,
      passwordHash,
      name: p.data.name,
      role: UserRole.CUSTOMER,
    },
  });
  await signSession({ sub: user.id, email: user.email, role: user.role });
  return NextResponse.json({ ok: true });
}
