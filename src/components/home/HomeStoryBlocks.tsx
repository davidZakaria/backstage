import Image from "next/image";
import type { HomeStoryBlock } from "@/lib/home-story-blocks";
import { Link } from "@/i18n/routing";

export function HomeStoryBlocks({
  blocks,
  locale,
}: {
  blocks: HomeStoryBlock[];
  locale: string;
}) {
  if (blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {blocks.map((block, i) => {
        const kicker = locale === "ar" ? block.kickerAr : block.kickerEn;
        const title = locale === "ar" ? block.titleAr : block.titleEn;
        const body = locale === "ar" ? block.bodyAr : block.bodyEn;
        const cta = locale === "ar" ? block.ctaAr : block.ctaEn;
        const href = block.href?.trim();
        const imageUrl = block.imageUrl?.trim();

        if (!title && !body && !imageUrl) return null;

        const isReversed = i % 2 === 1;

        return (
          <article
            key={`story-${i}-${title ?? imageUrl ?? ""}`}
            className="grid items-center gap-8 md:grid-cols-2 md:gap-12"
          >
            <div
              className={`relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/[0.06] bg-[var(--color-brand-primary)]/20 md:aspect-[5/4] ${
                isReversed ? "md:order-2" : ""
              }`}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title ?? ""}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 50vw"
                />
              ) : null}
            </div>
            <div className={`space-y-4 ${isReversed ? "md:order-1" : ""}`}>
              {kicker ? (
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-brand-muted)]">
                  {kicker}
                </p>
              ) : null}
              {title ? (
                <h2 className="font-display text-3xl leading-tight md:text-4xl">
                  {title}
                </h2>
              ) : null}
              {body ? (
                <p className="max-w-lg text-sm leading-relaxed text-[var(--color-brand-muted)] md:text-base">
                  {body}
                </p>
              ) : null}
              {href && cta ? (
                href.startsWith("http://") || href.startsWith("https://") ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full bg-[var(--color-brand-ink)] px-8 py-3 text-sm font-medium text-[var(--color-brand-primary)] transition hover:opacity-90"
                  >
                    {cta}
                  </a>
                ) : (
                  <Link
                    href={href}
                    className="inline-flex rounded-full bg-[var(--color-brand-ink)] px-8 py-3 text-sm font-medium text-[var(--color-brand-primary)] transition hover:opacity-90"
                  >
                    {cta}
                  </Link>
                )
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
