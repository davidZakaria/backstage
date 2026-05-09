"use client";

import type { Category, Product } from "@prisma/client";
import { slugify } from "@/lib/slugify";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ProductEditForm({
  product,
  allCategories,
}: {
  product: Product;
  allCategories: Category[];
}) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [slug, setSlug] = useState(product.slug);
  const [slugManual, setSlugManual] = useState(true);
  const [titleEn, setTitleEn] = useState(product.titleEn);

  useEffect(() => {
    setSlug(product.slug);
    setSlugManual(true);
    setTitleEn(product.titleEn);
  }, [product.id, product.updatedAt]);

  useEffect(() => {
    if (slugManual) return;
    const next = slugify(titleEn);
    setSlug((s) => (s !== next ? next : s));
  }, [titleEn, slugManual]);

  const inp =
    "w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-black/25 focus:outline-none";

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        const fd = new FormData(e.currentTarget);
        const primary = String(fd.get("primaryCategoryId") ?? "");
        const slugFinal = (slugManual ? slug : slugify(titleEn)).replace(/^-+|-+$/g, "");
        if (!slugFinal) {
          setErr("Slug is empty — use a Latin English title or a custom slug.");
          return;
        }
        const r = await fetch(`/api/admin/products/${product.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: slugFinal,
            titleEn,
            titleAr: fd.get("titleAr"),
            descriptionEn: fd.get("descriptionEn"),
            descriptionAr: fd.get("descriptionAr"),
            metaTitleEn: fd.get("metaTitleEn") || null,
            metaTitleAr: fd.get("metaTitleAr") || null,
            metaDescriptionEn: fd.get("metaDescriptionEn") || null,
            metaDescriptionAr: fd.get("metaDescriptionAr") || null,
            primaryCategoryId: primary ? primary : null,
            published: fd.get("published") === "on",
            featured: fd.get("featured") === "on",
          }),
        });
        const j = await r.json();
        if (!r.ok) {
          setErr(j.error ?? "Failed");
          return;
        }
        router.refresh();
      }}
    >
      <div className="space-y-1">
        <label className="block text-xs text-black/50">URL slug</label>
        <div className="flex flex-wrap gap-2">
          <input
            value={slug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(e.target.value);
            }}
            className={`${inp} min-w-[8rem] flex-1 font-mono`}
          />
          <button
            type="button"
            className="rounded-full border border-black/15 bg-white px-3 py-2 text-xs font-medium"
            onClick={() => {
              setSlugManual(false);
              setSlug(slugify(titleEn));
            }}
          >
            Match title
          </button>
        </div>
        <p className="text-[11px] text-black/40">
          {slugManual ? "Custom slug for this product URL." : "Slug updates from English title."}
        </p>
      </div>
      <label className="block space-y-1 text-xs">
        <span className="text-black/50">Title (EN)</span>
        <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inp} />
      </label>
      <input name="titleAr" defaultValue={product.titleAr} className={inp} placeholder="Title AR" />
      <textarea name="descriptionEn" defaultValue={product.descriptionEn} rows={3} className={inp} />
      <textarea name="descriptionAr" defaultValue={product.descriptionAr} rows={3} className={inp} />
      <input name="metaTitleEn" defaultValue={product.metaTitleEn ?? ""} placeholder="Meta title EN" className={inp} />
      <input name="metaTitleAr" defaultValue={product.metaTitleAr ?? ""} placeholder="Meta title AR" className={inp} />
      <input
        name="metaDescriptionEn"
        defaultValue={product.metaDescriptionEn ?? ""}
        placeholder="Meta desc EN"
        className={inp}
      />
      <input
        name="metaDescriptionAr"
        defaultValue={product.metaDescriptionAr ?? ""}
        placeholder="Meta desc AR"
        className={inp}
      />
      <label className="block text-sm">
        Primary category
        <select
          name="primaryCategoryId"
          defaultValue={product.primaryCategoryId ?? ""}
          className={`${inp} mt-1`}
        >
          <option value="">—</option>
          {allCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameEn}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="published" type="checkbox" defaultChecked={product.published} />
        Published
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="featured" type="checkbox" defaultChecked={product.featured} />
        Featured
      </label>
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      <button type="submit" className="rounded-full bg-black px-6 py-2 text-sm text-[#f5e8dd]">
        Save
      </button>
    </form>
  );
}
