"use client";

import { slugify } from "@/lib/slugify";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewProductPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!slugManual) setSlug(slugify(titleEn));
  }, [titleEn, slugManual]);

  const inp =
    "w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-black/25 focus:outline-none";

  return (
    <div className="mx-auto max-w-xl space-y-6 p-8">
      <div>
        <h1 className="font-display text-3xl">New product</h1>
        <p className="mt-1 text-sm text-black/50">
          URL slug is generated from the English title; unlock the field if you need a custom slug.
        </p>
      </div>
      <form
        className="space-y-4 rounded-2xl border border-black/8 bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          const slugFinal = (slugManual ? slug : slugify(titleEn)).replace(/^-+|-+$/g, "");
          if (!slugFinal) {
            setErr("Slug is empty — use a Latin English title or type a custom slug.");
            return;
          }
          const r = await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slug: slugFinal,
              titleEn,
              titleAr,
              descriptionEn: descEn,
              descriptionAr: descAr,
              published,
            }),
          });
          const j = await r.json();
          if (!r.ok) {
            setErr(j.error ?? "Failed");
            return;
          }
          router.push(`/admin/products/${j.id}`);
        }}
      >
        <label className="block space-y-1 text-xs">
          <span className="text-black/50">Title (EN)</span>
          <input
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            required
            className={inp}
          />
        </label>
        <label className="block space-y-1 text-xs">
          <span className="text-black/50">Title (AR)</span>
          <input
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
            required
            className={inp}
          />
        </label>
        <div className="flex flex-wrap items-end gap-2">
          <label className="block min-w-[12rem] flex-1 space-y-1 text-xs">
            <span className="text-black/50">URL slug</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value);
              }}
              className={`${inp} font-mono`}
              placeholder="aura-sofa"
            />
          </label>
          <button
            type="button"
            className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-medium"
            onClick={() => {
              setSlugManual(false);
              setSlug(slugify(titleEn));
            }}
          >
            Reset from title
          </button>
        </div>
        <p className="text-xs text-black/40">
          {slugManual ? "Custom slug — won’t change when you edit the title." : "Slug follows the English title."}
        </p>
        <label className="block space-y-1 text-xs">
          <span className="text-black/50">Description (EN)</span>
          <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3} className={inp} />
        </label>
        <label className="block space-y-1 text-xs">
          <span className="text-black/50">Description (AR)</span>
          <textarea value={descAr} onChange={(e) => setDescAr(e.target.value)} rows={3} className={inp} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published
        </label>
        {err ? <p className="text-sm text-red-700">{err}</p> : null}
        <button
          type="submit"
          className="rounded-full bg-[#1a1814] px-6 py-2.5 text-sm font-medium text-[#f5e8dd]"
        >
          Create
        </button>
      </form>
    </div>
  );
}
