"use client";

import Image from "next/image";
import { useCallback, useState, type KeyboardEvent } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import type { Media } from "@prisma/client";

export function ProductImageGallery({
  locale,
  title,
  images,
  video,
}: {
  locale: string;
  title: string;
  images: Media[];
  video?: Media | null;
}) {
  const imgs = images.filter((m) => m.type === "IMAGE");
  const [active, setActive] = useState(0);

  const safeIndex = imgs.length > 0 ? Math.min(active, imgs.length - 1) : 0;
  const main = imgs[safeIndex];

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (imgs.length < 2) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActive((i) => (i + 1) % imgs.length);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActive((i) => (i - 1 + imgs.length) % imgs.length);
      }
    },
    [imgs.length],
  );

  if (imgs.length === 0 && !video) return null;

  return (
    <div className="space-y-4">
      {main ? (
        <Zoom>
          <div
            role="img"
            aria-label={(locale === "ar" ? main.altAr : main.altEn) ?? title}
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-black/5 bg-[var(--color-brand-primary)]/20 outline-none ring-black/10 focus-visible:ring-2"
          >
            <Image
              src={main.url}
              alt={(locale === "ar" ? main.altAr : main.altEn) ?? title}
              width={1200}
              height={1200}
              className="h-full w-full object-cover"
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          </div>
        </Zoom>
      ) : null}

      {imgs.length > 1 ? (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Product images"
        >
          {imgs.map((im, i) => {
            const selected = i === safeIndex;
            return (
              <button
                key={im.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(i)}
                className={[
                  "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border transition md:h-24 md:w-24",
                  selected
                    ? "border-[var(--color-brand-ink)] ring-2 ring-[var(--color-brand-ink)]/25"
                    : "border-black/10 opacity-[0.85] hover:border-black/25 hover:opacity-100",
                ].join(" ")}
              >
                <Image
                  src={im.url}
                  alt={
                    (locale === "ar" ? im.altAr : im.altEn) ?? `${title} ${i + 1}`
                  }
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                  sizes="96px"
                />
              </button>
            );
          })}
        </div>
      ) : null}

      {video ? (
        <video
          className="w-full rounded-2xl border border-black/5"
          controls
          preload="none"
          poster={imgs[0]?.url}
        >
          <source src={video.url} />
        </video>
      ) : null}
    </div>
  );
}
