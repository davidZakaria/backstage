import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { NextResponse } from "next/server";
import { z } from "zod";

const PatchBody = z.object({
  sku: z.string().optional(),
  materialId: z.string().optional(),
  colorId: z.string().optional(),
  sizeId: z.string().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  compareCents: z.number().int().nullable().optional(),
  enabled: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const p = PatchBody.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await prisma.productVariant.update({ where: { id }, data: p.data });
  await writeAudit({
    adminUserId: auth.session.sub,
    action: "variant.update",
    entityType: "ProductVariant",
    entityId: id,
    metadata: p.data,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  try {
    await prisma.productVariant.delete({ where: { id } });
    await writeAudit({
      adminUserId: auth.session.sub,
      action: "variant.delete",
      entityType: "ProductVariant",
      entityId: id,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "In use on orders" }, { status: 400 });
  }
}
