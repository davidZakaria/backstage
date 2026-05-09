import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { finalizeSlug } from "@/lib/slugify";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const rows = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json({ categories: rows });
}

const PostBody = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const json = await req.json().catch(() => null);
  const p = PostBody.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const slug = finalizeSlug(p.data.slug, p.data.nameEn);
  if (!slug) {
    return NextResponse.json(
      { error: "Slug is empty — type a Latin slug or an English name that includes Latin letters." },
      { status: 400 },
    );
  }
  try {
    const c = await prisma.category.create({ data: { ...p.data, slug } });
    await writeAudit({
      adminUserId: auth.session.sub,
      action: "category.create",
      entityType: "Category",
      entityId: c.id,
    });
    return NextResponse.json({ id: c.id });
  } catch {
    return NextResponse.json({ error: "Create failed" }, { status: 400 });
  }
}
