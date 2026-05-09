"use client";

import type { Media } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { pushDataLayer } from "@/lib/analytics/dataLayer";

export function TransparencySection({
  title,
  body,
  media,
  locale,
}: {
  title: string;
  body: string;
  media: Media[];
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const img = media[0];
  return (
    <article className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
      {img ? (
        <div className="relative mb-6 aspect-video overflow-hidden rounded-xl bg-[var(--color-brand-primary)]/30">
          <Image src={img.url} alt={(locale === "ar" ? img.altAr : img.altEn) ?? title} fill className="object-cover" sizes="800px" />
        </div>
      ) : null}
      <h2 className="font-display text-3xl">{title}</h2>
      <p className="mt-4 leading-relaxed text-[var(--color-brand-muted)]">{body}</p>
      <button
        type="button"
        className="mt-6 text-sm font-medium underline-offset-4 hover:underline"
        onClick={() => {
          const next = !open;
          setOpen(next);
          pushDataLayer({
            event: "Transparency_Toggle_Click",
            section: title,
            open: next,
          });
        }}
      >
        {open ? "Hide detail" : "Show build detail"}
      </button>
      {open ? (
        <p className="mt-4 text-sm text-[var(--color-brand-muted)]">
          Lead times, finishing passes, and freight are bundled into the price you see — no hidden surcharges at delivery.
        </p>
      ) : null}
    </article>
  );
}
