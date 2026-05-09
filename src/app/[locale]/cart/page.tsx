"use client";

import { Link } from "@/i18n/routing";
import { useCartStore } from "@/lib/cart/store";
import { formatEGPFromCents } from "@/lib/money";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

export default function CartPage() {
  const locale = useLocale();
  const t = useTranslations("cart");
  const lines = useCartStore((s) => s.lines);
  const setQty = useCartStore((s) => s.setQty);
  const removeLine = useCartStore((s) => s.removeLine);
  const subtotal = lines.reduce(
    (a, l) => a + l.unitPriceCents * l.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-4xl">{t("title")}</h1>
      {lines.length === 0 ? (
        <p className="mt-8 text-[var(--color-brand-muted)]">{t("empty")}</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {lines.map((l) => (
            <li
              key={l.variantId}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/5 bg-white p-4"
            >
              <Link
                href={`/product/${l.productSlug}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--color-brand-primary)]/25"
              >
                {l.imageUrl ? (
                  <Image
                    src={l.imageUrl}
                    alt={l.productTitle}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : null}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${l.productSlug}`} className="font-medium">
                  {l.productTitle}
                </Link>
                <p className="text-xs text-[var(--color-brand-muted)]">{l.sku}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={l.quantity}
                  onChange={(e) =>
                    setQty(l.variantId, parseInt(e.target.value, 10) || 1)
                  }
                  className="w-16 rounded border border-black/10 px-2 py-1 text-sm"
                />
                <span className="text-sm">
                  {formatEGPFromCents(l.unitPriceCents * l.quantity, locale)}
                </span>
                <button
                  type="button"
                  className="text-xs text-red-700"
                  onClick={() => removeLine(l.variantId)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {lines.length > 0 ? (
        <div className="mt-10 flex flex-col gap-4 border-t border-black/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            {t("subtotal")}:{" "}
            <span className="font-display text-2xl">
              {formatEGPFromCents(subtotal, locale)}
            </span>
          </p>
          <div className="flex gap-3">
            <Link
              href="/shop"
              className="rounded-full border border-black/10 px-6 py-2 text-sm"
            >
              {t("continue")}
            </Link>
            <Link
              href="/checkout"
              className="rounded-full bg-[var(--color-brand-ink)] px-8 py-2 text-sm font-medium text-[var(--color-brand-primary)]"
            >
              {t("toCheckout")}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
