import { prisma } from "@/lib/prisma";
import { sendOrderSms } from "@/lib/integrations/twilio";
import { canTransition } from "@/lib/orders/state-machine";
import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import { writeAudit } from "@/lib/admin/audit";

const Body = z.object({
  orderId: z.string(),
  toStatus: z.nativeEnum(OrderStatus),
  note: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const { orderId, toStatus, note } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("Order not found");
      if (!canTransition(order.status, toStatus)) {
        throw new Error(`Cannot transition ${order.status} → ${toStatus}`);
      }
      await tx.order.update({
        where: { id: orderId },
        data: { status: toStatus },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus,
          note,
          actorUserId: session.sub,
        },
      });
    });
    await writeAudit({
      adminUserId: session.sub,
      action: "order.status",
      entityType: "Order",
      entityId: orderId,
      metadata: { to: toStatus },
    });
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order?.shippingPhone) {
      await sendOrderSms({
        to: order.shippingPhone,
        message: `Backstage: Order ${orderId.slice(0, 8)} is now ${toStatus}`,
      }).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
