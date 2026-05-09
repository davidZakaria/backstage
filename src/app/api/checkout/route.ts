import { prisma } from "@/lib/prisma";
import { pickShippingRuleCents } from "@/lib/shipping/compute";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendOrderSms } from "@/lib/integrations/twilio";
import { getSession } from "@/lib/auth/session";

const Body = z.object({
  guestEmail: z.string().email(),
  guestPhone: z.string().min(6),
  shippingLine1: z.string().min(2),
  shippingLine2: z.string().optional(),
  shippingCity: z.string().min(2),
  shippingZoneSlug: z.string(),
  lines: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const body = parsed.data;
  const session = await getSession().catch(() => null);

  const codSetting = await prisma.siteSetting.findUnique({
    where: { key: "cod_enabled" },
  });
  if (codSetting && codSetting.value !== "true") {
    return NextResponse.json(
      { error: "Cash on delivery is disabled" },
      { status: 400 },
    );
  }

  const zone = await prisma.shippingZone.findUnique({
    where: { slug: body.shippingZoneSlug },
    include: { rateRules: { orderBy: { sortOrder: "asc" } } },
  });
  if (!zone) {
    return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
  }

  try {
    const orderId = await prisma.$transaction(async (tx) => {
      const lines: {
        variantId: string;
        quantity: number;
        unitPriceCents: number;
      }[] = [];

      let subtotal = 0;

      for (const line of body.lines) {
        const variant = await tx.productVariant.findUnique({
          where: { id: line.variantId, enabled: true },
          include: { inventory: true },
        });
        if (!variant) throw new Error("Variant not found");
        const stock = variant.inventory?.quantityOnHand ?? 0;
        if (stock < line.quantity) throw new Error("Insufficient stock");

        subtotal += variant.priceCents * line.quantity;
        lines.push({
          variantId: variant.id,
          quantity: line.quantity,
          unitPriceCents: variant.priceCents,
        });
      }

      const shippingCents = pickShippingRuleCents(zone, 0);
      const total = subtotal + shippingCents;

      const order = await tx.order.create({
        data: {
          userId: session?.sub,
          guestEmail: session ? undefined : body.guestEmail,
          guestPhone: body.guestPhone,
          status: OrderStatus.PLACED,
          paymentMethod: PaymentMethod.COD,
          shippingZoneId: zone.id,
          shippingLine1: body.shippingLine1,
          shippingLine2: body.shippingLine2,
          shippingCity: body.shippingCity,
          shippingPhone: body.guestPhone,
          subtotalCents: subtotal,
          shippingCents,
          totalCents: total,
        },
      });

      for (const l of lines) {
        await tx.orderLine.create({
          data: {
            orderId: order.id,
            variantId: l.variantId,
            quantity: l.quantity,
            unitPriceCents: l.unitPriceCents,
          },
        });
        await tx.inventory.update({
          where: { variantId: l.variantId },
          data: { quantityOnHand: { decrement: l.quantity } },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: null,
          toStatus: OrderStatus.PLACED,
          note: "Checkout (COD)",
          actorUserId: session?.sub,
        },
      });

      return order.id;
    });

    await sendOrderSms({
      to: body.guestPhone,
      message: `Backstage: Order placed (COD). ID ${orderId.slice(0, 8)}…`,
    }).catch(() => {});

    return NextResponse.json({ ok: true, orderId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
