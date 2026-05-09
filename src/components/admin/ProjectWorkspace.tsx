"use client";

import type { InteriorProject, Media } from "@prisma/client";
import { MediaType } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { slugify } from "@/lib/slugify";

type ProjectWithMedia = InteriorProject & { media: Media[] };

export function ProjectWorkspace({ project }: { project: ProjectWithMedia }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState(project.slug);
  const [slugManual, setSlugManual] = useState(true);
  const [titleEn, setTitleEn] = useState(project.titleEn);
  const [titleAr, setTitleAr] = useState(project.titleAr);
  const [bodyEn, setBodyEn] = useState(project.bodyEn);
  const [bodyAr, setBodyAr] = useState(project.bodyAr);
  const [tags, setTags] = useState(project.tags);
  const [published, setPublished] = useState(project.published);
  const [sortOrder, setSortOrder] = useState(project.sortOrder);
  const [newUrl, setNewUrl] = useState("");
  const [newAltEn, setNewAltEn] = useState("");
  const [newAltAr, setNewAltAr] = useState("");
  const [mediaMsg, setMediaMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  useEffect(() => {
    setSlug(project.slug);
    setSlugManual(true);
    setTitleEn(project.titleEn);
    setTitleAr(project.titleAr);
    setBodyEn(project.bodyEn);
    setBodyAr(project.bodyAr);
    setTags(project.tags);
    setPublished(project.published);
    setSortOrder(project.sortOrder);
  }, [project.id, project.updatedAt]);

  useEffect(() => {
    if (slugManual) return;
    const next = slugify(titleEn);
    setSlug((s) => (s !== next ? next : s));
  }, [titleEn, slugManual]);

  const field =
    "w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-black/25 focus:outline-none";

  async function save() {
    setSaving(true);
    setSaveErr(null);
    try {
      const slugFinal = (slugManual ? slug : slugify(titleEn)).replace(/^-+|-+$/g, "");
      if (!slugFinal) {
        setSaveErr("Add a Latin slug or English title with Latin letters.");
        return;
      }
      await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
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
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function addMediaWithUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    setMediaMsg(null);
    const r = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        url: trimmed,
        type: MediaType.IMAGE,
        altEn: newAltEn || undefined,
        altAr: newAltAr || undefined,
        sortOrder: project.media.length,
      }),
    });
    const j = (await r.json().catch(() => ({}))) as { error?: string };
    if (!r.ok) {
      setMediaMsg(j.error ?? "Could not add image");
      return;
    }
    setNewUrl("");
    setNewAltEn("");
    setNewAltAr("");
    router.refresh();
  }

  async function removeMedia(id: string) {
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const mediaSorted = [...project.media].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-black/45">
            Interior project
          </p>
          <h1 className="font-display text-3xl">Edit: {project.titleEn}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/en/projects"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm"
          >
            Gallery on site
          </Link>
          <Link
            href={`/en/projects/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm"
          >
            Preview this project
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-black/70">Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1 text-xs sm:col-span-2">
            <span className="text-black/50">URL slug</span>
            <div className="flex flex-wrap gap-2">
              <input
                value={slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setSlug(e.target.value);
                }}
                className={`${field} min-w-[12rem] flex-1 font-mono`}
              />
              <button
                type="button"
                className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-medium whitespace-nowrap"
                onClick={() => {
                  setSlugManual(false);
                  setSlug(slugify(titleEn));
                }}
              >
                Match English title
              </button>
            </div>
            <span className="text-[11px] text-black/40">
              {slugManual
                ? "Custom slug — safe when renaming the project on the site."
                : "Slug updates when the English title changes."}
            </span>
          </label>
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
            <span className="text-black/50">Title (EN)</span>
            <input
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className={field}
            />
          </label>
          <label className="block space-y-1 text-xs">
            <span className="text-black/50">Title (AR)</span>
            <input
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              className={field}
            />
          </label>
        </div>
        <label className="mt-4 block space-y-1 text-xs">
          <span className="text-black/50">Body (EN)</span>
          <textarea
            value={bodyEn}
            onChange={(e) => setBodyEn(e.target.value)}
            rows={5}
            className={field}
          />
        </label>
        <label className="mt-3 block space-y-1 text-xs">
          <span className="text-black/50">Body (AR)</span>
          <textarea
            value={bodyAr}
            onChange={(e) => setBodyAr(e.target.value)}
            rows={5}
            className={field}
          />
        </label>
        <label className="mt-3 block space-y-1 text-xs">
          <span className="text-black/50">Tags (comma-separated)</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={field} />
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published (visible on storefront)
        </label>
        {saveErr ? <p className="mt-4 text-xs text-red-700">{saveErr}</p> : null}
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="mt-4 rounded-full bg-[#1a1814] px-6 py-2.5 text-sm font-medium text-[#f5e8dd] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-black/70">Gallery</h2>
        <p className="mt-1 text-xs text-black/45">
          Paste a hosted image URL, or upload a file (Supabase or Cloudinary must be configured like
          for product media).
        </p>

        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setMediaMsg(null);
            const form = e.currentTarget;
            const fileInput = form.elements.namedItem("galleryFile") as HTMLInputElement;
            const file = fileInput.files?.[0];
            let url = newUrl.trim();
            if (file) {
              setUploadBusy(true);
              try {
                const up = new FormData();
                up.append("file", file);
                const ures = await fetch("/api/admin/upload", { method: "POST", body: up });
                const uj = (await ures.json().catch(() => ({}))) as {
                  url?: string;
                  error?: string;
                };
                if (!ures.ok) {
                  setMediaMsg(uj.error ?? "Upload failed");
                  return;
                }
                url = uj.url ?? "";
              } finally {
                setUploadBusy(false);
              }
            }
            if (!url) {
              setMediaMsg("Add a URL or choose a file to upload.");
              return;
            }
            await addMediaWithUrl(url);
            form.reset();
            setNewUrl("");
          }}
        >
          <input
            name="galleryUrl"
            placeholder="Image URL (optional if uploading)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className={field}
          />
          <div className="rounded-lg border border-dashed border-black/15 bg-[#faf8f6] px-3 py-4">
            <label className="block text-xs text-black/50">
              <span className="mb-1 block font-medium text-black/60">Upload image</span>
              <input
                name="galleryFile"
                type="file"
                accept="image/*"
                className="w-full text-xs file:mr-3 file:rounded-full file:border-0 file:bg-black/80 file:px-3 file:py-1.5 file:text-[#f5e8dd]"
              />
            </label>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              placeholder="Alt text (EN)"
              value={newAltEn}
              onChange={(e) => setNewAltEn(e.target.value)}
              className={field}
            />
            <input
              placeholder="Alt text (AR)"
              value={newAltAr}
              onChange={(e) => setNewAltAr(e.target.value)}
              className={field}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={uploadBusy}
              className="rounded-full bg-black/80 px-5 py-2 text-sm text-white disabled:opacity-50"
            >
              {uploadBusy ? "Uploading…" : "Add to gallery"}
            </button>
          </div>
        </form>

        {mediaMsg ? <p className="mt-2 text-xs text-red-700">{mediaMsg}</p> : null}

        <ul className="mt-6 divide-y divide-black/5">
          {mediaSorted.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-4 py-4 text-sm"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-only arbitrary URLs */}
                <img
                  src={m.url}
                  alt={m.altEn || ""}
                  className="h-16 w-24 shrink-0 rounded-md border border-black/10 object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-black/70">{m.url}</p>
                  {(m.altEn || m.altAr) && (
                    <p className="mt-0.5 truncate text-xs text-black/45">
                      {[m.altEn, m.altAr].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void removeMedia(m.id)}
                className="shrink-0 text-red-700 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
