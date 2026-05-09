import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { MediaType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const PatchBody = z.object({
  url: z.string().url().optional(),
  type: z.nativeEnum(MediaType).optional(),
  altEn: z.string().nullable().optional(),
  altAr: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
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
  await prisma.media.update({ where: { id }, data: p.data });
  await writeAudit({
    adminUserId: auth.session.sub,
    action: "media.update",
    entityType: "Media",
    entityId: id,
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
  await prisma.media.delete({ where: { id } });
  await writeAudit({
    adminUserId: auth.session.sub,
    action: "media.delete",
    entityType: "Media",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
