import type { PaymentMethod } from "@prisma/client";

export type PaymentIntentResult =
  | { kind: "cod"; orderId: string }
  | { kind: "redirect"; url: string }
  | { kind: "client_secret"; clientSecret: string };

export interface PaymentAdapter {
  readonly id: string;
  createPayment(params: {
    orderId: string;
    amountCents: number;
    method: PaymentMethod;
    customerEmail: string;
    customerPhone: string;
  }): Promise<PaymentIntentResult>;
  handleWebhook?(request: Request): Promise<{ ok: boolean }>;
}

export function codAdapter(): PaymentAdapter {
  return {
    id: "cod",
    async createPayment({ orderId }) {
      return { kind: "cod", orderId };
    },
  };
}
