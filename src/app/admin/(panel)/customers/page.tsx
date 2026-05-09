import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserRole } from "@prisma/client";

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    where: { role: UserRole.CUSTOMER },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
    take: 200,
  });
  return (
    <div className="space-y-6 p-8">
      <h1 className="font-display text-3xl">Customers</h1>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b text-black/50">
            <th className="py-2">Email</th>
            <th className="py-2">Name</th>
            <th className="py-2">Orders</th>
            <th className="py-2">Since</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-black/5">
              <td className="py-2">{u.email}</td>
              <td className="py-2">{u.name ?? "—"}</td>
              <td className="py-2">
                <Link href={`/admin/orders`} className="underline">
                  {u._count.orders}
                </Link>
              </td>
              <td className="py-2 text-xs">{u.createdAt.toISOString().slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
