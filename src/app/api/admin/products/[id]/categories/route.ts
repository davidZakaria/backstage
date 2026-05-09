import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({ categoryId: z.string() });

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
  await prisma.productCategory.create({
    data: { productId, categoryId: p.data.categoryId },
  });
  await writeAudit({
    adminUserId: auth.session.sub,
    action: "product.category.add",
    entityType: "Product",
    entityId: productId,
    metadata: p.data,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id: productId } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  if (!categoryId) return NextResponse.json({ error: "categoryId required" }, { status: 400 });
  await prisma.productCategory.delete({
    where: { productId_categoryId: { productId, categoryId } },
  });
  await writeAudit({
    adminUserId: auth.session.sub,
    action: "product.category.remove",
    entityType: "Product",
    entityId: productId,
    metadata: { categoryId },
  });
  return NextResponse.json({ ok: true });
}
