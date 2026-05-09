import { mailchimpSubscribe } from "@/lib/integrations/mailchimp";
import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const p = Body.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  await mailchimpSubscribe(p.data.email);
  return NextResponse.json({ ok: true });
}
