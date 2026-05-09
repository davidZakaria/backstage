import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { writeAudit } from "@/lib/admin/audit";
import { finalizeSlug } from "@/lib/slugify";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  slug: z.string().optional(),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  published: z.boolean().optional(),
});

export async function POST(req: Request) {
  const s = await getSession();
  if (!s || s.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const p = Body.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const slug = finalizeSlug(p.data.slug, p.data.titleEn);
  if (!slug) {
    return NextResponse.json(
      { error: "Slug is empty — use a Latin English title or type a URL slug." },
      { status: 400 },
    );
  }
  try {
    const product = await prisma.product.create({
      data: {
        slug,
        titleEn: p.data.titleEn,
        titleAr: p.data.titleAr,
        descriptionEn: p.data.descriptionEn ?? "",
        descriptionAr: p.data.descriptionAr ?? "",
        published: p.data.published ?? false,
      },
    });
    await writeAudit({
      adminUserId: s.sub,
      action: "product.create",
      entityType: "Product",
      entityId: product.id,
    });
    return NextResponse.json({ id: product.id });
  } catch {
    return NextResponse.json({ error: "Create failed" }, { status: 400 });
  }
}
