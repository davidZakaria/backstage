import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10) || 100, 500);
  const logs = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { admin: { select: { email: true } } },
  });
  return NextResponse.json({ logs });
}
