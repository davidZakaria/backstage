import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const users = await prisma.user.findMany({
    where: { role: UserRole.CUSTOMER },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
      addresses: { take: 1 },
    },
    take: 200,
  });
  return NextResponse.json({
    customers: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      orders: u._count.orders,
      createdAt: u.createdAt,
    })),
  });
}
