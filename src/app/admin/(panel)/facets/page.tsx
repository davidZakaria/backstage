"use client";

import { slugify } from "@/lib/slugify";
import { useEffect, useState } from "react";

type Row = { id: string; nameEn: string; nameAr: string; slug: string };

function FacetTable({
  title,
  endpoint,
}: {
  title: string;
  endpoint: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (!slugManual) setSlug(slugify(nameEn));
  }, [nameEn, slugManual]);

  async function load() {
    const r = await fetch(endpoint);
    const j = await r.json();
    setRows(j.items ?? []);
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial admin fetch
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- endpoint is stable for this table
  }, [endpoint]);

  const inp = "rounded-lg border border-black/10 px-2 py-1.5 text-xs focus:border-black/25 focus:outline-none";

  return (
    <div className="space-y-3 rounded-2xl border border-black/8 bg-white p-4 shadow-sm">
      <h2 className="font-display text-lg">{title}</h2>
      <p className="text-xs text-black/45">Slug is derived from the English label unless you edit it.</p>
      <form
        className="space-y-2 text-xs"
        onSubmit={async (e) => {
          e.preventDefault();
          const slugFinal = (slugManual ? slug : slugify(nameEn)).replace(/^-+|-+$/g, "");
          if (!slugFinal) return;
          await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nameEn,
              nameAr,
              slug: slugFinal,
            }),
          });
          setNameEn("");
          setNameAr("");
          setSlug("");
          setSlugManual(false);
          await load();
        }}
      >
        <div className="grid gap-2 md:grid-cols-2">
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            required
            placeholder="English name"
            className={inp}
          />
          <input
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            required
            placeholder="Arabic name"
            className={inp}
          />
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <input
            value={slug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(e.target.value);
            }}
            placeholder="url-slug"
            className={`${inp} min-w-[8rem] flex-1 font-mono md:max-w-xs`}
          />
          <button
            type="button"
            className="rounded-full border border-black/15 bg-white px-3 py-1.5"
            onClick={() => {
              setSlugManual(false);
              setSlug(slugify(nameEn));
            }}
          >
            From EN
          </button>
          <button type="submit" className="rounded-full bg-[#1a1814] px-4 py-1.5 text-[#f5e8dd]">
            Add
          </button>
        </div>
      </form>
      <ul className="space-y-1 text-xs">
        {rows.map((r) => (
          <li key={r.id} className="flex justify-between gap-2 border-t border-black/5 pt-1">
            <span>
              {r.nameEn} <span className="font-mono text-black/50">· {r.slug}</span>
            </span>
            <button
              type="button"
              className="text-red-700 hover:underline"
              onClick={async () => {
                await fetch(`${endpoint}/${r.id}`, { method: "DELETE" });
                await load();
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminFacetsPage() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="font-display text-3xl">Facets (material · color · size)</h1>
        <p className="mt-1 text-sm text-black/50">SKUs and filters use these slugs — keep them stable after launch.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <FacetTable title="Materials" endpoint="/api/admin/materials" />
        <FacetTable title="Colors" endpoint="/api/admin/colors" />
        <FacetTable title="Sizes" endpoint="/api/admin/sizes" />
      </div>
    </div>
  );
}
