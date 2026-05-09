"use client";

import type { Category, Color, Material, Size } from "@prisma/client";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

export function ShopFilters({
  locale,
  categories,
  materials,
  colors,
  sizes,
  initial,
}: {
  locale: string;
  categories: Category[];
  materials: Material[];
  colors: Color[];
  sizes: Size[];
  initial: {
    category?: string;
    material?: string;
    color?: string;
    size?: string;
    priceMin?: string;
    priceMax?: string;
  };
}) {
  const t = useTranslations("shop");
  const router = useRouter();

  const apply = useCallback(
    (formData: FormData) => {
      const params = new URLSearchParams();
      const c = formData.get("category") as string;
      const m = formData.get("material") as string;
      const col = formData.get("color") as string;
      const s = formData.get("size") as string;
      const pmin = formData.get("priceMin") as string;
      const pmax = formData.get("priceMax") as string;
      if (c) params.set("category", c);
      if (m) params.set("material", m);
      if (col) params.set("color", col);
      if (s) params.set("size", s);
      if (pmin) params.set("priceMin", pmin);
      if (pmax) params.set("priceMax", pmax);
      const q = params.toString();
      router.push(q ? `/shop?${q}` : "/shop");
    },
    [router],
  );

  return (
    <form
      className="sticky top-24 space-y-5 rounded-2xl border border-black/5 bg-white p-5 text-sm shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        apply(new FormData(e.currentTarget));
      }}
    >
      <p className="font-display text-lg">{t("title")}</p>
      <label className="block space-y-1">
        <span className="text-[var(--color-brand-muted)]">{t("filterCategory")}</span>
        <select
          name="category"
          defaultValue={initial.category ?? ""}
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2"
        >
          <option value="">—</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {locale === "ar" ? c.nameAr : c.nameEn}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-[var(--color-brand-muted)]">{t("filterMaterial")}</span>
        <select
          name="material"
          defaultValue={initial.material ?? ""}
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2"
        >
          <option value="">—</option>
          {materials.map((m) => (
            <option key={m.id} value={m.slug}>
              {locale === "ar" ? m.nameAr : m.nameEn}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-[var(--color-brand-muted)]">{t("filterColor")}</span>
        <select
          name="color"
          defaultValue={initial.color ?? ""}
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2"
        >
          <option value="">—</option>
          {colors.map((c) => (
            <option key={c.id} value={c.slug}>
              {locale === "ar" ? c.nameAr : c.nameEn}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-[var(--color-brand-muted)]">{t("filterSize")}</span>
        <select
          name="size"
          defaultValue={initial.size ?? ""}
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2"
        >
          <option value="">—</option>
          {sizes.map((s) => (
            <option key={s.id} value={s.slug}>
              {locale === "ar" ? s.nameAr : s.nameEn}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[var(--color-brand-muted)]">{t("filterPrice")} min</span>
          <input
            name="priceMin"
            type="number"
            defaultValue={initial.priceMin ?? ""}
            placeholder="cents"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[var(--color-brand-muted)]">{t("filterPrice")} max</span>
          <input
            name="priceMax"
            type="number"
            defaultValue={initial.priceMax ?? ""}
            placeholder="cents"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-full bg-[var(--color-brand-ink)] py-2 text-xs font-medium text-[var(--color-brand-primary)]"
        >
          Apply
        </button>
        <button
          type="button"
          className="rounded-full border border-black/10 px-4 py-2 text-xs"
          onClick={() => router.push("/shop")}
        >
          {t("clear")}
        </button>
      </div>
    </form>
  );
}
