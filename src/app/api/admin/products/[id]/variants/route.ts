import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  sku: z.string().min(1),
  materialId: z.string(),
  colorId: z.string(),
  sizeId: z.string(),
  priceCents: z.number().int().nonnegative(),
  compareCents: z.number().int().optional().nullable(),
  enabled: z.boolean().optional(),
  initialStock: z.number().int().nonnegative().optional(),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id: productId } = await ctx.params;
  const json = await req.json().catch(() => null);
  const p = Body.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  try {
    const v = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId,
          sku: p.data.sku,
          materialId: p.data.materialId,
          colorId: p.data.colorId,
          sizeId: p.data.sizeId,
          priceCents: p.data.priceCents,
          compareCents: p.data.compareCents ?? undefined,
          enabled: p.data.enabled ?? true,
        },
      });
      await tx.inventory.create({
        data: {
          variantId: variant.id,
          quantityOnHand: p.data.initialStock ?? 0,
        },
      });
      return variant;
    });
    await writeAudit({
      adminUserId: auth.session.sub,
      action: "variant.create",
      entityType: "ProductVariant",
      entityId: v.id,
    });
    return NextResponse.json({ id: v.id });
  } catch {
    return NextResponse.json({ error: "Failed (duplicate SKU?)" }, { status: 400 });
  }
}
