import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartLine = {
  variantId: string;
  productSlug: string;
  productTitle: string;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  /** First product image (optional; older carts may omit). */
  imageUrl?: string;
};

type CartState = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQty: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine: (line) => {
        const qty = line.quantity ?? 1;
        const existing = get().lines.find((l) => l.variantId === line.variantId);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.variantId === line.variantId
                ? {
                    ...l,
                    quantity: l.quantity + qty,
                    imageUrl: l.imageUrl ?? line.imageUrl,
                  }
                : l,
            ),
          });
        } else {
          set({
            lines: [...get().lines, { ...line, quantity: qty }],
          });
        }
      },
      setQty: (variantId, quantity) => {
        if (quantity <= 0) {
          set({ lines: get().lines.filter((l) => l.variantId !== variantId) });
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.variantId === variantId ? { ...l, quantity } : l,
          ),
        });
      },
      removeLine: (variantId) =>
        set({ lines: get().lines.filter((l) => l.variantId !== variantId) }),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "backstage-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
