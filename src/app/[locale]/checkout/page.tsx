"use client";

import { useCartStore } from "@/lib/cart/store";
import { formatEGPFromCents } from "@/lib/money";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function CheckoutPage() {
  const locale = useLocale();
  const t = useTranslations("checkout");
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const [zones, setZones] = useState<{ slug: string; label: string }[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/shipping/zones");
      const j = (await r.json()) as { zones?: { slug: string; label: string }[] };
      setZones(j.zones ?? []);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      guestEmail: String(fd.get("guestEmail") ?? ""),
      guestPhone: String(fd.get("guestPhone") ?? ""),
      shippingLine1: String(fd.get("shippingLine1") ?? ""),
      shippingLine2: String(fd.get("shippingLine2") ?? ""),
      shippingCity: String(fd.get("shippingCity") ?? ""),
      shippingZoneSlug: String(fd.get("shippingZoneSlug") ?? ""),
      lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
    };
    const r = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) {
      setStatus(j.error ?? "Failed");
      return;
    }
    clear();
    setStatus(t("success"));
    router.push("/my-stage");
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <p className="text-[var(--color-brand-muted)]">Cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-4xl">{t("title")}</h1>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input type="hidden" name="linesReady" value="1" />
          <label className="block space-y-1 text-sm">
            <span>{t("email")}</span>
            <input
              name="guestEmail"
              type="email"
              required
              className="w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>{t("phone")}</span>
            <input
              name="guestPhone"
              required
              className="w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>{t("line1")}</span>
            <input
              name="shippingLine1"
              required
              className="w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>{t("line2")}</span>
            <input name="shippingLine2" className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
          <label className="block space-y-1 text-sm">
            <span>{t("city")}</span>
            <input name="shippingCity" required className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
          <label className="block space-y-1 text-sm">
            <span>{t("zone")}</span>
            <select name="shippingZoneSlug" required className="w-full rounded-lg border border-black/10 px-3 py-2">
              <option value="">—</option>
              {zones.map((z) => (
                <option key={z.slug} value={z.slug}>
                  {z.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked readOnly />
            <span>{t("cod")}</span>
          </label>
          {status ? <p className="text-sm text-green-800">{status}</p> : null}
          <button
            type="submit"
            className="w-full rounded-full bg-[var(--color-brand-ink)] py-3 text-sm font-medium text-[var(--color-brand-primary)]"
          >
            {t("placeOrder")}
          </button>
        </form>
      </div>
      <div className="rounded-2xl border border-black/5 bg-white p-6 text-sm shadow-sm">
        <p className="font-display text-xl">Summary</p>
        <ul className="mt-4 space-y-3">
          {lines.map((l) => (
            <li
              key={l.variantId}
              className="flex items-center justify-between gap-3 border-b border-black/5 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--color-brand-primary)]/25">
                  {l.imageUrl ? (
                    <Image
                      src={l.imageUrl}
                      alt={l.productTitle}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : null}
                </div>
                <span className="min-w-0 truncate">
                  {l.productTitle} × {l.quantity}
                </span>
              </div>
              <span className="shrink-0">
                {formatEGPFromCents(l.unitPriceCents * l.quantity, locale)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
