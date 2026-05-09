import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const outcomes = await prisma.quizOutcome.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ outcomes });
}
