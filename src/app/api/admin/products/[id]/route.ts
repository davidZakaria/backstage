import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { writeAudit } from "@/lib/admin/audit";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  titleEn: z.string().optional(),
  titleAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  slug: z.string().optional(),
  metaTitleEn: z.string().nullable().optional(),
  metaTitleAr: z.string().nullable().optional(),
  metaDescriptionEn: z.string().nullable().optional(),
  metaDescriptionAr: z.string().nullable().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  primaryCategoryId: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const s = await getSession();
  if (!s || s.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const p = Body.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const data = { ...p.data };
  if (data.slug !== undefined) {
    const slugRaw = data.slug.trim().replace(/^-+|-+$/g, "");
    if (!slugRaw) {
      return NextResponse.json(
        { error: "Slug cannot be empty — use Latin letters or sync from the English title." },
        { status: 400 },
      );
    }
    data.slug = slugRaw;
  }
  const product = await prisma.product.update({
    where: { id },
    data,
  });
  await writeAudit({
    adminUserId: s.sub,
    action: "product.update",
    entityType: "Product",
    entityId: id,
    metadata: data,
  });
  return NextResponse.json({ ok: true, slug: product.slug });
}
