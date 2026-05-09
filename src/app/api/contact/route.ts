import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(5),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const p = Body.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  console.info("[contact]", p.data);
  // Hook: forward to CRM, email, or Twilio later
  return NextResponse.json({ ok: true });
}
