import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { NextResponse } from "next/server";
import { z } from "zod";

const PatchBody = z.object({
  titleEn: z.string().optional(),
  titleAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
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
  await prisma.quizOutcome.update({ where: { id }, data: p.data });
  await writeAudit({
    adminUserId: auth.session.sub,
    action: "quiz_outcome.update",
    entityType: "QuizOutcome",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
