"use client";

import { slugify } from "@/lib/slugify";
import { useEffect, useState } from "react";

type Zone = {
  id: string;
  nameEn: string;
  slug: string;
  rateRules: { id: string; feeCents: number; labelEn: string | null }[];
};

export default function AdminShippingPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");

  useEffect(() => {
    if (!slugManual) setSlug(slugify(nameEn));
  }, [nameEn, slugManual]);

  async function load() {
    const r = await fetch("/api/admin/shipping/zones");
    const j = await r.json();
    setZones(j.zones ?? []);
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial admin fetch
    void load();
  }, []);

  const field =
    "w-full rounded-lg border border-black/10 px-2 py-1.5 text-sm focus:border-black/25 focus:outline-none";

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="font-display text-3xl">Shipping</h1>
        <p className="mt-1 text-sm text-black/50">
          Zone slug is generated from the English name (used internally); override only if needed.
        </p>
      </div>
      <form
        className="max-w-md space-y-3 rounded-2xl border border-black/8 bg-white p-4 text-sm shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          const slugFinal = (slugManual ? slug : slugify(nameEn)).replace(/^-+|-+$/g, "");
          if (!slugFinal) return;
          await fetch("/api/admin/shipping/zones", {
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
        <p className="font-medium">New zone</p>
        <label className="block space-y-1 text-xs">
          <span className="text-black/50">Name (EN)</span>
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            required
            className={field}
          />
        </label>
        <label className="block space-y-1 text-xs">
          <span className="text-black/50">Name (AR)</span>
          <input
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            required
            className={field}
          />
        </label>
        <div className="flex flex-wrap items-end gap-2">
          <label className="block min-w-[10rem] flex-1 space-y-1 text-xs">
            <span className="text-black/50">Slug</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value);
              }}
              className={`${field} font-mono`}
            />
          </label>
          <button
            type="button"
            className="rounded-full border border-black/15 bg-white px-3 py-1.5 text-xs"
            onClick={() => {
              setSlugManual(false);
              setSlug(slugify(nameEn));
            }}
          >
            From EN name
          </button>
        </div>
        <button type="submit" className="rounded-full bg-[#1a1814] px-5 py-2 text-xs font-medium text-[#f5e8dd]">
          Add zone
        </button>
      </form>

      {zones.map((z) => (
        <div key={z.id} className="rounded border bg-white p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">
              {z.nameEn}{" "}
              <span className="font-mono text-xs text-black/50">({z.slug})</span>
            </p>
            <button
              type="button"
              className="text-xs text-red-700"
              onClick={async () => {
                await fetch(`/api/admin/shipping/zones/${z.id}`, { method: "DELETE" });
                await load();
              }}
            >
              Delete zone
            </button>
          </div>
          <form
            className="mt-3 flex flex-wrap gap-2 text-xs"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await fetch("/api/admin/shipping/rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  zoneId: z.id,
                  feeCents: parseInt(String(fd.get("feeCents")), 10),
                  labelEn: fd.get("labelEn"),
                }),
              });
              (e.target as HTMLFormElement).reset();
              await load();
            }}
          >
            <input type="hidden" name="zone" value={z.id} />
            <input name="feeCents" type="number" placeholder="fee cents" required className="rounded border px-2 py-1" />
            <input name="labelEn" placeholder="label" className="rounded border px-2 py-1" />
            <button type="submit" className="rounded border px-2 py-1">
              Add rule
            </button>
          </form>
          <ul className="mt-2 space-y-1 text-xs">
            {z.rateRules.map((rr) => (
              <li key={rr.id} className="flex justify-between gap-2">
                <span>
                  {rr.labelEn ?? "Rule"} — {(rr.feeCents / 100).toFixed(0)} EGP
                </span>
                <button
                  type="button"
                  className="text-red-700"
                  onClick={async () => {
                    await fetch(`/api/admin/shipping/rules/${rr.id}`, { method: "DELETE" });
                    await load();
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
