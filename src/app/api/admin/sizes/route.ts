import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { finalizeSlug } from "@/lib/slugify";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const items = await prisma.size.findMany({ orderBy: { nameEn: "asc" } });
  return NextResponse.json({ items });
}

const PostBody = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().optional(),
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
      { error: "Slug is empty — use a Latin English name or type a slug." },
      { status: 400 },
    );
  }
  try {
    const row = await prisma.size.create({ data: { ...p.data, slug } });
    await writeAudit({
      adminUserId: auth.session.sub,
      action: "size.create",
      entityType: "Size",
      entityId: row.id,
    });
    return NextResponse.json({ id: row.id });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 400 });
  }
}
