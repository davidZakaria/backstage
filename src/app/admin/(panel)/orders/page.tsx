import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
    take: 80,
  });
  return (
    <div className="space-y-6 p-8">
      <h1 className="font-display text-3xl">Orders</h1>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 text-black/50">
            <th className="py-2">ID</th>
            <th className="py-2">Status</th>
            <th className="py-2">Total</th>
            <th className="py-2">Customer</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-black/5">
              <td className="py-2 font-mono text-xs">{o.id.slice(0, 10)}…</td>
              <td className="py-2">{o.status}</td>
              <td className="py-2">{(o.totalCents / 100).toFixed(0)} EGP</td>
              <td className="py-2">{o.user?.email ?? o.guestEmail ?? "guest"}</td>
              <td className="py-2">
                <Link href={`/admin/orders/${o.id}`} className="underline">
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
