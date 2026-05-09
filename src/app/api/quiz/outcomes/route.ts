import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const outcomes = await prisma.quizOutcome.findMany({ orderBy: { sortOrder: "asc" } });
  const map: Record<
    string,
    { title: string; description: string; imageUrl?: string }
  > = {};
  for (const o of outcomes) {
    map[o.key] = {
      title: o.titleEn,
      description: o.descriptionEn,
      imageUrl: o.imageUrl ?? undefined,
    };
  }
  return NextResponse.json({ outcomes: map });
}
