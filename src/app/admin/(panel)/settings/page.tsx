"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [s, setS] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/admin/settings");
      const j = await r.json();
      setS(j.settings ?? {});
    })();
  }, []);
  if (!s) return <p className="p-8 text-sm">Loading…</p>;
  return (
    <div className="space-y-8 p-8">
      <h1 className="font-display text-3xl">Settings</h1>
      <form
        className="max-w-2xl space-y-3 text-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          for (const key of [
            "cod_enabled",
            "whatsapp_number",
            "site_contact_email",
            "home_story_blocks",
          ] as const) {
            await fetch("/api/admin/settings", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                key,
                value: String(fd.get(key) ?? ""),
              }),
            });
          }
          const r = await fetch("/api/admin/settings");
          const j = await r.json();
          setS(j.settings ?? {});
        }}
      >
        <label className="block space-y-1">
          <span className="text-xs text-black/60">COD enabled (true/false)</span>
          <input
            name="cod_enabled"
            defaultValue={s.cod_enabled ?? "true"}
            key={s.cod_enabled}
            className="w-full rounded border px-2 py-1"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-black/60">WhatsApp number (E.164)</span>
          <input
            name="whatsapp_number"
            defaultValue={s.whatsapp_number ?? ""}
            key={s.whatsapp_number}
            className="w-full rounded border px-2 py-1"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-black/60">Site contact email</span>
          <input
            name="site_contact_email"
            defaultValue={s.site_contact_email ?? ""}
            key={s.site_contact_email}
            className="w-full rounded border px-2 py-1"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-black/60">
            Home story blocks (JSON array) — see repo{" "}
            <code className="rounded bg-black/5 px-1">docs/design-references.md</code>
          </span>
          <textarea
            name="home_story_blocks"
            rows={10}
            defaultValue={s.home_story_blocks ?? ""}
            key={s.home_story_blocks}
            className="w-full rounded border px-2 py-1 font-mono text-xs"
            spellCheck={false}
          />
        </label>
        <button type="submit" className="rounded bg-black px-4 py-2 text-xs text-[#f5e8dd]">
          Save settings
        </button>
      </form>
    </div>
  );
}
