"use client";

import { slugify } from "@/lib/slugify";
import { useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  published: boolean;
};

type EditDraft = {
  nameEn: string;
  nameAr: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  published: boolean;
  slugManual: boolean;
};

function parentOptions(rows: Category[], excludeId?: string) {
  return rows.filter((r) => r.id !== excludeId);
}

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [nNameEn, setNNameEn] = useState("");
  const [nNameAr, setNNameAr] = useState("");
  const [nSlug, setNSlug] = useState("");
  const [nSlugManual, setNSlugManual] = useState(false);
  const [nParentId, setNParentId] = useState<string>("");
  const [nSort, setNSort] = useState(0);
  const [nPublished, setNPublished] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [editErr, setEditErr] = useState<string | null>(null);

  useEffect(() => {
    if (!nSlugManual) setNSlug(slugify(nNameEn));
  }, [nNameEn, nSlugManual]);

  const parentLabel = useMemo(() => {
    const m = new Map(rows.map((r) => [r.id, r.nameEn]));
    return (id: string | null) => (id ? (m.get(id) ?? id) : "—");
  }, [rows]);

  async function load() {
    const r = await fetch("/api/admin/categories");
    const j = await r.json();
    setRows(j.categories ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial admin fetch
    void load();
  }, []);

  function beginEdit(c: Category) {
    setEditingId(c.id);
    setDraft({
      nameEn: c.nameEn,
      nameAr: c.nameAr,
      slug: c.slug,
      parentId: c.parentId,
      sortOrder: c.sortOrder,
      published: c.published,
      slugManual: true,
    });
    setEditErr(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    setEditErr(null);
  }

  useEffect(() => {
    if (!draft?.nameEn || draft.slugManual) return;
    const next = slugify(draft.nameEn);
    setDraft((d) => (d && d.slug !== next ? { ...d, slug: next } : d));
  }, [draft?.nameEn, draft?.slugManual]);

  const field =
    "w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-black/25 focus:outline-none";

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <div>
        <h1 className="font-display text-3xl">Categories</h1>
        <p className="mt-1 text-sm text-black/50">
          Slug is generated from the English name. Expand “URL slug” only if you need a custom path
          (shop links use this value).
        </p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-black/8 bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          const slugFinal = (nSlugManual ? nSlug : slugify(nNameEn)).replace(/^-+|-+$/g, "");
          if (!slugFinal) {
            setErr("Slug is empty — use Latin letters in the English name, or unlock and type a slug.");
            return;
          }
          const r = await fetch("/api/admin/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nameEn: nNameEn,
              nameAr: nNameAr,
              slug: slugFinal,
              parentId: nParentId || null,
              sortOrder: nSort,
              published: nPublished,
            }),
          });
          const j = await r.json();
          if (!r.ok) setErr(j.error ?? "Failed");
          else {
            setNNameEn("");
            setNNameAr("");
            setNSlug("");
            setNSlugManual(false);
            setNParentId("");
            setNSort(0);
            setNPublished(true);
            await load();
          }
        }}
      >
        <p className="text-sm font-semibold text-black/70">New category</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1 text-xs">
            <span className="text-black/50">Name (English)</span>
            <input
              value={nNameEn}
              onChange={(e) => setNNameEn(e.target.value)}
              required
              className={field}
              placeholder="Living"
            />
          </label>
          <label className="block space-y-1 text-xs">
            <span className="text-black/50">Name (Arabic)</span>
            <input
              value={nNameAr}
              onChange={(e) => setNNameAr(e.target.value)}
              required
              className={field}
              placeholder="…"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block min-w-[12rem] flex-1 space-y-1 text-xs">
            <span className="text-black/50">URL slug</span>
            <input
              value={nSlug}
              onChange={(e) => {
                setNSlugManual(true);
                setNSlug(e.target.value);
              }}
              className={`${field} font-mono`}
              placeholder="living"
            />
          </label>
          <button
            type="button"
            className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-medium"
            onClick={() => {
              setNSlugManual(false);
              setNSlug(slugify(nNameEn));
            }}
          >
            Reset from English name
          </button>
        </div>
        <p className="text-xs text-black/40">
          {nSlugManual
            ? "Editing slug manually — it will not change when you edit the English name."
            : "Slug updates automatically from the English name."}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1 text-xs">
            <span className="text-black/50">Parent (optional)</span>
            <select
              value={nParentId}
              onChange={(e) => setNParentId(e.target.value)}
              className={field}
            >
              <option value="">None</option>
              {rows.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEn} ({c.slug})
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-xs">
            <span className="text-black/50">Sort order</span>
            <input
              type="number"
              value={nSort}
              onChange={(e) => setNSort(parseInt(e.target.value, 10) || 0)}
              className={field}
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={nPublished}
            onChange={(e) => setNPublished(e.target.checked)}
          />
          Published on storefront
        </label>
        {err ? <p className="text-xs text-red-700">{err}</p> : null}
        <button
          type="submit"
          className="rounded-full bg-[#1a1814] px-6 py-2.5 text-sm font-medium text-[#f5e8dd]"
        >
          Create category
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-black/8 bg-white shadow-sm">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/8 text-xs text-black/50">
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">EN</th>
              <th className="px-4 py-3">AR</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Sort</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) =>
              editingId === c.id && draft ? (
                <tr key={c.id} className="border-b border-black/5 bg-[#faf8f6]">
                  <td colSpan={7} className="px-4 py-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <label className="block space-y-1 text-xs">
                        <span className="text-black/50">Name (EN)</span>
                        <input
                          value={draft.nameEn}
                          onChange={(e) =>
                            setDraft((d) => (d ? { ...d, nameEn: e.target.value } : null))
                          }
                          className={field}
                        />
                      </label>
                      <label className="block space-y-1 text-xs">
                        <span className="text-black/50">Name (AR)</span>
                        <input
                          value={draft.nameAr}
                          onChange={(e) =>
                            setDraft((d) => (d ? { ...d, nameAr: e.target.value } : null))
                          }
                          className={field}
                        />
                      </label>
                      <label className="block space-y-1 text-xs">
                        <span className="text-black/50">URL slug</span>
                        <input
                          value={draft.slug}
                          onChange={(e) =>
                            setDraft((d) =>
                              d ? { ...d, slug: e.target.value, slugManual: true } : null,
                            )
                          }
                          className={`${field} font-mono`}
                        />
                      </label>
                      <label className="block space-y-1 text-xs">
                        <span className="text-black/50">Parent</span>
                        <select
                          value={draft.parentId ?? ""}
                          onChange={(e) =>
                            setDraft((d) =>
                              d
                                ? { ...d, parentId: e.target.value ? e.target.value : null }
                                : null,
                            )
                          }
                          className={field}
                        >
                          <option value="">None</option>
                          {parentOptions(rows, c.id).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nameEn}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block space-y-1 text-xs">
                        <span className="text-black/50">Sort</span>
                        <input
                          type="number"
                          value={draft.sortOrder}
                          onChange={(e) =>
                            setDraft((d) =>
                              d ? { ...d, sortOrder: parseInt(e.target.value, 10) || 0 } : null,
                            )
                          }
                          className={field}
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm sm:col-span-2 lg:col-span-1">
                        <input
                          type="checkbox"
                          checked={draft.published}
                          onChange={(e) =>
                            setDraft((d) => (d ? { ...d, published: e.target.checked } : null))
                          }
                        />
                        Published
                      </label>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-black/15 bg-white px-4 py-1.5 text-xs"
                        onClick={() =>
                          setDraft((d) =>
                            d ? { ...d, slugManual: false, slug: slugify(d.nameEn) } : null,
                          )
                        }
                      >
                        Match slug to English name
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-[#1a1814] px-5 py-1.5 text-xs font-medium text-[#f5e8dd]"
                        onClick={async () => {
                          if (!draft) return;
                          setEditErr(null);
                          const slugFinal = (
                            draft.slugManual ? draft.slug : slugify(draft.nameEn)
                          ).replace(/^-+|-+$/g, "");
                          if (!slugFinal) {
                            setEditErr("Slug is empty — add Latin text to the name or slug.");
                            return;
                          }
                          const r = await fetch(`/api/admin/categories/${c.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              nameEn: draft.nameEn,
                              nameAr: draft.nameAr,
                              slug: slugFinal,
                              parentId: draft.parentId,
                              sortOrder: draft.sortOrder,
                              published: draft.published,
                            }),
                          });
                          const j = await r.json();
                          if (!r.ok) setEditErr(j.error ?? "Save failed");
                          else {
                            cancelEdit();
                            await load();
                          }
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="rounded-full px-4 py-1.5 text-xs text-black/60"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                      {editErr ? (
                        <span className="w-full text-xs text-red-700">{editErr}</span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={c.id} className="border-b border-black/5">
                  <td className="px-4 py-2 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-2">{c.nameEn}</td>
                  <td className="px-4 py-2">{c.nameAr}</td>
                  <td className="px-4 py-2 text-xs text-black/60">{parentLabel(c.parentId)}</td>
                  <td className="px-4 py-2">{c.sortOrder}</td>
                  <td className="px-4 py-2">{c.published ? "yes" : "no"}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      className="mr-2 text-xs font-medium text-black/70 hover:underline"
                      onClick={() => beginEdit(c)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-700 hover:underline"
                      onClick={async () => {
                        if (
                          !confirm(
                            `Delete category “${c.nameEn}”? This fails if products still use it.`,
                          )
                        )
                          return;
                        await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
                        await load();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
