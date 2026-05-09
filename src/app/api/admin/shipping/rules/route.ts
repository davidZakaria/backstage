import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { NextResponse } from "next/server";
import { z } from "zod";

const PostBody = z.object({
  zoneId: z.string(),
  feeCents: z.number().int().nonnegative(),
  labelEn: z.string().optional(),
  labelAr: z.string().optional(),
  minWeightKg: z.number().optional().nullable(),
  maxWeightKg: z.number().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const json = await req.json().catch(() => null);
  const p = PostBody.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const rule = await prisma.shippingRateRule.create({
    data: {
      zoneId: p.data.zoneId,
      feeCents: p.data.feeCents,
      labelEn: p.data.labelEn,
      labelAr: p.data.labelAr,
      minWeightKg: p.data.minWeightKg ?? undefined,
      maxWeightKg: p.data.maxWeightKg ?? undefined,
      sortOrder: p.data.sortOrder ?? 0,
    },
  });
  await writeAudit({
    adminUserId: auth.session.sub,
    action: "shipping_rule.create",
    entityType: "ShippingRateRule",
    entityId: rule.id,
  });
  return NextResponse.json({ id: rule.id });
}
