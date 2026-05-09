import { OrderStatus } from "@prisma/client";

const allowed: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PLACED]: [
    OrderStatus.CONFIRMED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.CONFIRMED]: [
    OrderStatus.UNDER_MANUFACTURING,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.UNDER_MANUFACTURING]: [
    OrderStatus.READY_TO_SHIP,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.READY_TO_SHIP]: [
    OrderStatus.SHIPPED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.SHIPPED]: [
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.DELIVERED]: [OrderStatus.WARRANTY_OR_FIX],
  [OrderStatus.WARRANTY_OR_FIX]: [],
  [OrderStatus.CANCELLED]: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return allowed[from]?.includes(to) ?? false;
}

export function getAllowedNextStatuses(current: OrderStatus): OrderStatus[] {
  return allowed[current] ?? [];
}
