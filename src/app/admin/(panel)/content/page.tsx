"use client";

import Link from "next/link";
import { slugify } from "@/lib/slugify";
import { useEffect, useState } from "react";

type Article = {
  id: string;
  slug: string;
  titleEn: string;
  published: boolean;
};
type Outcome = {
  id: string;
  key: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  imageUrl: string | null;
};

export default function AdminContentPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);

  const [artSlug, setArtSlug] = useState("");
  const [artSlugManual, setArtSlugManual] = useState(false);
  const [artTitleEn, setArtTitleEn] = useState("");
  const [artTitleAr, setArtTitleAr] = useState("");
  const [artBodyEn, setArtBodyEn] = useState("");
  const [artBodyAr, setArtBodyAr] = useState("");
  const [artPublished, setArtPublished] = useState(false);
  const [artErr, setArtErr] = useState<string | null>(null);

  useEffect(() => {
    if (!artSlugManual) setArtSlug(slugify(artTitleEn));
  }, [artTitleEn, artSlugManual]);

  const field =
    "w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-black/25 focus:outline-none";

  async function load() {
    const [a, o] = await Promise.all([
      fetch("/api/admin/backstage").then((r) => r.json()),
      fetch("/api/admin/quiz/outcomes").then((r) => r.json()),
    ]);
    setArticles(a.articles ?? []);
    setOutcomes(o.outcomes ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial admin fetch
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div>
        <h1 className="font-display text-3xl">Articles & quiz</h1>
        <p className="mt-1 text-sm text-black/50">
          Backstage editorial posts and Mix &amp; Match outcomes.{" "}
          <Link
            href="/admin/projects"
            className="font-medium text-[#1a1814] underline underline-offset-2"
          >
            Interior projects (gallery)
          </Link>{" "}
          have their own admin section.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-950">
        <strong>Jura / Projects:</strong> create and edit gallery entries under{" "}
        <Link href="/admin/projects" className="font-medium underline">
          Interior projects
        </Link>{" "}
        — connected to <code className="rounded bg-black/5 px-1">/en/projects</code>.
      </div>

      <section className="space-y-4 rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Backstage — new article</h2>
        <form
          className="max-w-xl space-y-3 text-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            setArtErr(null);
            const slugFinal = (artSlugManual ? artSlug : slugify(artTitleEn)).replace(/^-+|-+$/g, "");
            if (!slugFinal) {
              setArtErr("Slug is empty — use a Latin English title or type a slug.");
              return;
            }
            const r = await fetch("/api/admin/backstage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                slug: slugFinal,
                titleEn: artTitleEn,
                titleAr: artTitleAr,
                bodyEn: artBodyEn,
                bodyAr: artBodyAr,
                published: artPublished,
              }),
            });
            const j = (await r.json().catch(() => ({}))) as { error?: string };
            if (!r.ok) {
              setArtErr(j.error ?? "Create failed");
              return;
            }
            setArtSlug("");
            setArtSlugManual(false);
            setArtTitleEn("");
            setArtTitleAr("");
            setArtBodyEn("");
            setArtBodyAr("");
            setArtPublished(false);
            await load();
          }}
        >
          <label className="block space-y-1 text-xs">
            <span className="text-black/50">Title (EN)</span>
            <input
              value={artTitleEn}
              onChange={(e) => setArtTitleEn(e.target.value)}
              required
              className={field}
              placeholder="Title EN"
            />
          </label>
          <label className="block space-y-1 text-xs">
            <span className="text-black/50">Title (AR)</span>
            <input
              value={artTitleAr}
              onChange={(e) => setArtTitleAr(e.target.value)}
              required
              className={field}
              placeholder="Title AR"
            />
          </label>
          <div className="flex flex-wrap items-end gap-2">
            <label className="block min-w-[12rem] flex-1 space-y-1 text-xs">
              <span className="text-black/50">URL slug</span>
              <input
                value={artSlug}
                onChange={(e) => {
                  setArtSlugManual(true);
                  setArtSlug(e.target.value);
                }}
                className={`${field} font-mono`}
                placeholder="my-article"
              />
            </label>
            <button
              type="button"
              className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-medium"
              onClick={() => {
                setArtSlugManual(false);
                setArtSlug(slugify(artTitleEn));
              }}
            >
              Reset from title
            </button>
          </div>
          <p className="text-xs text-black/40">
            {artSlugManual ? "Custom slug for the article URL." : "Slug follows the English title."}
          </p>
          <textarea
            value={artBodyEn}
            onChange={(e) => setArtBodyEn(e.target.value)}
            rows={3}
            className={field}
            placeholder="Body EN"
          />
          <textarea
            value={artBodyAr}
            onChange={(e) => setArtBodyAr(e.target.value)}
            rows={3}
            className={field}
            placeholder="Body AR"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={artPublished}
              onChange={(e) => setArtPublished(e.target.checked)}
            />
            Published
          </label>
          {artErr ? <p className="text-xs text-red-700">{artErr}</p> : null}
          <button
            type="submit"
            className="rounded-full bg-[#1a1814] px-5 py-2 text-sm font-medium text-[#f5e8dd]"
          >
            Create article
          </button>
        </form>
        <ul className="mt-6 divide-y divide-black/5 text-sm">
          {articles.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <span>
                <span className="font-mono text-xs">{a.slug}</span>
                {!a.published ? (
                  <span className="ms-2 text-xs text-black/45">(draft)</span>
                ) : null}
              </span>
              <button
                type="button"
                className="text-xs text-red-700 hover:underline"
                onClick={async () => {
                  await fetch(`/api/admin/backstage/${a.id}`, { method: "DELETE" });
                  await load();
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Quiz outcomes</h2>
        <ul className="space-y-4 text-sm">
          {outcomes.map((o) => (
            <li key={o.id} className="rounded-xl border border-black/8 bg-black/[0.02] p-4">
              <strong>{o.key}</strong>
              <span className="text-black/50"> — {o.titleEn}</span>
              <form
                className="mt-3 space-y-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  await fetch(`/api/admin/quiz/outcomes/${o.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      titleEn: fd.get("titleEn"),
                      titleAr: fd.get("titleAr"),
                      descriptionEn: fd.get("descriptionEn"),
                      descriptionAr: fd.get("descriptionAr"),
                      imageUrl: fd.get("imageUrl") || null,
                    }),
                  });
                  await load();
                }}
              >
                <input
                  name="titleEn"
                  defaultValue={o.titleEn}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs"
                />
                <input
                  name="titleAr"
                  defaultValue={o.titleAr}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs"
                />
                <textarea
                  name="descriptionEn"
                  rows={2}
                  defaultValue={o.descriptionEn}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs"
                />
                <textarea
                  name="descriptionAr"
                  rows={2}
                  defaultValue={o.descriptionAr}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs"
                />
                <input
                  name="imageUrl"
                  defaultValue={o.imageUrl ?? ""}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs"
                  placeholder="image url"
                />
                <button
                  type="submit"
                  className="rounded-full border border-black/15 bg-white px-4 py-1.5 text-xs font-medium"
                >
                  Save outcome
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
