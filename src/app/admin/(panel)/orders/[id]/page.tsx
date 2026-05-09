import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { OrderTransition } from "@/components/admin/OrderTransition";
import { OrderInternalNoteForm } from "@/components/admin/OrderInternalNoteForm";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      lines: { include: { variant: { include: { product: true } } } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) notFound();

  return (
    <div className="space-y-6 p-8">
      <h1 className="font-display text-3xl">Order</h1>
      <p className="font-mono text-xs text-black/50">{order.id}</p>
      <p>
        Status: <strong>{order.status}</strong>
      </p>
      <OrderTransition orderId={order.id} current={order.status} />
      <OrderInternalNoteForm orderId={order.id} initial={order.internalNote} />
      <div>
        <p className="text-sm font-medium">Lines</p>
        <ul className="mt-2 text-sm">
          {order.lines.map((l) => (
            <li key={l.id}>
              {l.variant.product.slug} · {l.variant.sku} × {l.quantity} @{" "}
              {(l.unitPriceCents / 100).toFixed(0)} EGP
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-sm font-medium">Timeline</p>
        <ol className="mt-2 list-decimal text-sm ps-4">
          {order.statusHistory.map((h) => (
            <li key={h.id}>
              {h.fromStatus ?? "—"} → {h.toStatus} ({h.createdAt.toISOString()})
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
