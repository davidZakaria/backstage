import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { finalizeSlug } from "@/lib/slugify";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const articles = await prisma.backstageArticle.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ articles });
}

const PostBody = z.object({
  slug: z.string().optional(),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  bodyEn: z.string().optional(),
  bodyAr: z.string().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const json = await req.json().catch(() => null);
  const p = PostBody.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const slug = finalizeSlug(p.data.slug, p.data.titleEn);
  if (!slug) {
    return NextResponse.json(
      { error: "Slug is empty — use a Latin English title or type a URL slug." },
      { status: 400 },
    );
  }
  try {
    const row = await prisma.backstageArticle.create({
      data: {
        slug,
        titleEn: p.data.titleEn,
        titleAr: p.data.titleAr,
        bodyEn: p.data.bodyEn ?? "",
        bodyAr: p.data.bodyAr ?? "",
        published: p.data.published ?? false,
        sortOrder: p.data.sortOrder ?? 0,
      },
    });
    await writeAudit({
      adminUserId: auth.session.sub,
      action: "backstage.create",
      entityType: "BackstageArticle",
      entityId: row.id,
    });
    return NextResponse.json({ id: row.id });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 400 });
  }
}
