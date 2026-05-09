import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { NextResponse } from "next/server";
import { z } from "zod";

const PatchBody = z.object({
  slug: z.string().optional(),
  titleEn: z.string().optional(),
  titleAr: z.string().optional(),
  bodyEn: z.string().optional(),
  bodyAr: z.string().optional(),
  tags: z.string().optional(),
  published: z.boolean().optional(),
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
  const data = { ...p.data };
  if (data.slug !== undefined) {
    const slugRaw = (data.slug.trim() || "").replace(/^-+|-+$/g, "");
    if (!slugRaw) {
      return NextResponse.json(
        { error: "Slug cannot be empty — use Latin letters or a manual URL slug." },
        { status: 400 },
      );
    }
    data.slug = slugRaw;
  }
  await prisma.interiorProject.update({ where: { id }, data });
  await writeAudit({
    adminUserId: auth.session.sub,
    action: "project.update",
    entityType: "InteriorProject",
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
  await prisma.media.deleteMany({ where: { projectId: id } });
  await prisma.interiorProject.delete({ where: { id } });
  await writeAudit({
    adminUserId: auth.session.sub,
    action: "project.delete",
    entityType: "InteriorProject",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
