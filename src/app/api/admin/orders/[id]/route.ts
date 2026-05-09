import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { NextResponse } from "next/server";
import { z } from "zod";

const PatchBody = z.object({
  internalNote: z.string().nullable().optional(),
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
  const data: { internalNote?: string | null } = {};
  if (p.data.internalNote !== undefined) data.internalNote = p.data.internalNote;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }
  await prisma.order.update({ where: { id }, data });
  await writeAudit({
    adminUserId: auth.session.sub,
    action: "order.note",
    entityType: "Order",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
