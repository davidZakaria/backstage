import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  productId: z.string(),
  orderedIds: z.array(z.string()),
});

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const json = await req.json().catch(() => null);
  const p = Body.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const existing = await prisma.media.findMany({
    where: { productId: p.data.productId },
    select: { id: true },
  });
  const allowed = new Set(existing.map((e) => e.id));
  for (const id of p.data.orderedIds) {
    if (!allowed.has(id)) {
      return NextResponse.json({ error: "Invalid media id for product" }, { status: 400 });
    }
  }
  await prisma.$transaction(
    p.data.orderedIds.map((id, idx) =>
      prisma.media.update({ where: { id }, data: { sortOrder: idx } }),
    ),
  );
  await writeAudit({
    adminUserId: auth.session.sub,
    action: "media.reorder",
    entityType: "Product",
    entityId: p.data.productId,
    metadata: p.data.orderedIds,
  });
  return NextResponse.json({ ok: true });
}
