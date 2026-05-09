import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { MediaType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  productId: z.string().optional(),
  projectId: z.string().optional(),
  backstageId: z.string().optional(),
  url: z.string().url(),
  type: z.nativeEnum(MediaType).optional(),
  altEn: z.string().optional(),
  altAr: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const json = await req.json().catch(() => null);
  const p = Body.safeParse(json);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const owners = [p.data.productId, p.data.projectId, p.data.backstageId].filter(Boolean);
  if (owners.length !== 1) {
    return NextResponse.json({ error: "Exactly one owner id required" }, { status: 400 });
  }
  const row = await prisma.media.create({
    data: {
      productId: p.data.productId,
      projectId: p.data.projectId,
      backstageId: p.data.backstageId,
      url: p.data.url,
      type: p.data.type ?? MediaType.IMAGE,
      altEn: p.data.altEn,
      altAr: p.data.altAr,
      sortOrder: p.data.sortOrder ?? 0,
    },
  });
  await writeAudit({
    adminUserId: auth.session.sub,
    action: "media.create",
    entityType: "Media",
    entityId: row.id,
  });
  return NextResponse.json({ id: row.id });
}
