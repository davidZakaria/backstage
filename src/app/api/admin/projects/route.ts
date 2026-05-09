import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { finalizeSlug } from "@/lib/slugify";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const projects = await prisma.interiorProject.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ projects });
}

const PostBody = z.object({
  slug: z.string().optional(),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  bodyEn: z.string().optional(),
  bodyAr: z.string().optional(),
  tags: z.string().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const json = await req.json().catch(() => null);
  const p = PostBody.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const slugRaw = finalizeSlug(p.data.slug, p.data.titleEn);
  if (!slugRaw) {
    return NextResponse.json(
      { error: "Slug is empty — add a Latin URL slug or an English title with Latin letters." },
      { status: 400 },
    );
  }
  try {
    const row = await prisma.interiorProject.create({
      data: {
        slug: slugRaw,
        titleEn: p.data.titleEn,
        titleAr: p.data.titleAr,
        bodyEn: p.data.bodyEn ?? "",
        bodyAr: p.data.bodyAr ?? "",
        tags: p.data.tags ?? "",
        published: p.data.published ?? false,
        sortOrder: p.data.sortOrder ?? 0,
      },
    });
    await writeAudit({
      adminUserId: auth.session.sub,
      action: "project.create",
      entityType: "InteriorProject",
      entityId: row.id,
    });
    return NextResponse.json({ id: row.id });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 400 });
  }
}
