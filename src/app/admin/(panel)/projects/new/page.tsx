"use client";

import { slugify } from "@/lib/slugify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminNewProjectPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [bodyEn, setBodyEn] = useState("");
  const [bodyAr, setBodyAr] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    if (!slugManual) setSlug(slugify(titleEn));
  }, [titleEn, slugManual]);

  const field =
    "w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-black/25 focus:outline-none";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href="/admin/projects"
          className="text-sm text-black/50 hover:text-black hover:underline"
        >
          ← All projects
        </Link>
        <h1 className="mt-4 font-display text-3xl">New interior project</h1>
        <p className="mt-1 text-sm text-black/50">
          Slug fills from the English title; you can override it for a shorter URL. Gallery images
          can be added after you save.
        </p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-black/8 bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setErr(null);
          const slugFinal = (slugManual ? slug : slugify(titleEn)).replace(/^-+|-+$/g, "");
          if (!slugFinal) {
            setErr("Slug is empty — use a Latin title or type a custom slug.");
            setPending(false);
            return;
          }
          try {
            const r = await fetch("/api/admin/projects", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                slug: slugFinal,
                titleEn,
                titleAr,
                bodyEn,
                bodyAr,
                tags,
                published,
                sortOrder,
              }),
            });
            const j = (await r.json()) as { id?: string; error?: string };
            if (!r.ok) setErr(j.error ?? "Failed");
            else if (j.id) router.push(`/admin/projects/${j.id}`);
          } finally {
            setPending(false);
          }
        }}
      >
        <label className="block space-y-1 text-xs">
          <span className="text-black/50">Title (EN)</span>
          <input
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            required
            className={field}
          />
        </label>
        <label className="block space-y-1 text-xs">
          <span className="text-black/50">Title (AR)</span>
          <input
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
            required
            className={field}
          />
        </label>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block min-w-[12rem] flex-1 space-y-1 text-xs">
            <span className="text-black/50">URL slug</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value);
              }}
              className={`${field} font-mono`}
              placeholder="penthouse-oak"
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
          {slugManual
            ? "Custom slug — it won’t change when you edit the title."
            : "Slug follows the English title."}
        </p>
        <label className="block space-y-1 text-xs">
          <span className="text-black/50">Sort order</span>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
            className={field}
          />
        </label>
        <label className="block space-y-1 text-xs">
          <span className="text-black/50">Body (EN)</span>
          <textarea
            value={bodyEn}
            onChange={(e) => setBodyEn(e.target.value)}
            rows={3}
            className={field}
          />
        </label>
        <label className="block space-y-1 text-xs">
          <span className="text-black/50">Body (AR)</span>
          <textarea
            value={bodyAr}
            onChange={(e) => setBodyAr(e.target.value)}
            rows={3}
            className={field}
          />
        </label>
        <label className="block space-y-1 text-xs">
          <span className="text-black/50">Tags</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="comma-separated"
            className={field}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
        {err ? <p className="text-xs text-red-700">{err}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[#1a1814] px-6 py-2.5 text-sm font-medium text-[#f5e8dd] disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create & edit"}
        </button>
      </form>
    </div>
  );
}
