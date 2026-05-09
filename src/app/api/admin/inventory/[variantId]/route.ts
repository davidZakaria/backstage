import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  quantityOnHand: z.number().int().nonnegative(),
  reason: z.string().optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ variantId: string }> },
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { variantId } = await ctx.params;
  const json = await req.json().catch(() => null);
  const p = Body.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await prisma.inventory.upsert({
    where: { variantId },
    create: { variantId, quantityOnHand: p.data.quantityOnHand },
    update: { quantityOnHand: p.data.quantityOnHand },
  });
  await writeAudit({
    adminUserId: auth.session.sub,
    action: "inventory.set",
    entityType: "Inventory",
    entityId: variantId,
    metadata: { quantityOnHand: p.data.quantityOnHand, reason: p.data.reason },
  });
  return NextResponse.json({ ok: true });
}
