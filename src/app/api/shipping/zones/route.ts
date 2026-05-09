import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const zones = await prisma.shippingZone.findMany({
    orderBy: { sortOrder: "asc" },
    select: { slug: true, nameEn: true, nameAr: true },
  });
  return NextResponse.json({
    zones: zones.map((z) => ({ slug: z.slug, label: `${z.nameEn} / ${z.nameAr}` })),
  });
}
