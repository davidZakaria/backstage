"use client";

import type { Color, Inventory, Material, ProductVariant, Size } from "@prisma/client";
import { useCartStore } from "@/lib/cart/store";
import { formatEGPFromCents } from "@/lib/money";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type Variant = ProductVariant & {
  material: Material;
  color: Color;
  size: Size;
  inventory: Inventory | null;
};

export function ProductPurchasePanel({
  locale,
  productSlug,
  productTitle,
  variants,
  imageUrl,
}: {
  locale: string;
  productSlug: string;
  productTitle: string;
  variants: Variant[];
  imageUrl?: string | null;
}) {
  const t = useTranslations("product");
  const addLine = useCartStore((s) => s.addLine);
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");

  const selected = useMemo(
    () => variants.find((v) => v.id === variantId) ?? variants[0],
    [variantId, variants],
  );

  if (!selected) return null;

  const stock = selected.inventory?.quantityOnHand ?? 0;

  return (
    <fieldset className="space-y-5 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <legend className="font-display text-lg font-semibold text-[var(--color-brand-ink)]">
        {t("purchaseOptions")}
      </legend>

      <div className="space-y-2 text-sm">
        <label
          htmlFor="variant-select"
          className="block text-xs font-medium uppercase tracking-wide text-[var(--color-brand-muted)]"
        >
          {t("selectVariant")}
        </label>
        <select
          id="variant-select"
          value={selected.id}
          onChange={(e) => setVariantId(e.target.value)}
          className="w-full rounded-lg border border-black/15 bg-[var(--color-brand-canvas)]/50 px-3 py-3 text-base text-[var(--color-brand-ink)]"
        >
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {locale === "ar" ? v.material.nameAr : v.material.nameEn} ·{" "}
              {locale === "ar" ? v.color.nameAr : v.color.nameEn} ·{" "}
              {locale === "ar" ? v.size.nameAr : v.size.nameEn} —{" "}
              {formatEGPFromCents(v.priceCents, locale)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-baseline justify-between gap-4 border-t border-black/5 pt-4">
        <span className="font-display text-3xl tabular-nums text-[var(--color-brand-ink)]">
          {formatEGPFromCents(selected.priceCents, locale)}
        </span>
        <span
          className={`text-sm font-medium ${
            stock > 0
              ? "text-emerald-800/90"
              : "text-[var(--color-brand-muted)]"
          }`}
        >
          {stock > 0 ? t("inStock") : t("outOfStock")}
        </span>
      </div>

      <button
        type="button"
        disabled={stock <= 0}
        onClick={() => {
          addLine({
            variantId: selected.id,
            productSlug,
            productTitle,
            sku: selected.sku,
            unitPriceCents: selected.priceCents,
            quantity: 1,
            ...(imageUrl ? { imageUrl } : {}),
          });
        }}
        className="w-full rounded-full bg-[var(--color-brand-ink)] py-3.5 text-sm font-semibold text-[var(--color-brand-primary)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("addToCart")}
      </button>
    </fieldset>
  );
}
