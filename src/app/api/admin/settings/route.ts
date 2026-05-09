import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { NextResponse } from "next/server";
import { z } from "zod";

const KEYS = [
  "cod_enabled",
  "whatsapp_number",
  "site_contact_email",
  "home_story_blocks",
] as const;

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: [...KEYS] } },
  });
  const map: Record<string, string> = {
    cod_enabled: "true",
    whatsapp_number: "",
    site_contact_email: "",
    home_story_blocks: "",
  };
  for (const r of rows) map[r.key] = r.value;
  return NextResponse.json({ settings: map });
}

const PatchBody = z.object({
  key: z.enum(KEYS),
  value: z.string(),
});

export async function PATCH(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const json = await req.json().catch(() => null);
  const p = PatchBody.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await prisma.siteSetting.upsert({
    where: { key: p.data.key },
    create: { key: p.data.key, value: p.data.value },
    update: { value: p.data.value },
  });
  await writeAudit({
    adminUserId: auth.session.sub,
    action: "settings.update",
    entityType: "SiteSetting",
    entityId: p.data.key,
    metadata: { value: p.data.value },
  });
  return NextResponse.json({ ok: true });
}
