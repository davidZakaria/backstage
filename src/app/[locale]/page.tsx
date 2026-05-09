import { prisma } from "@/lib/prisma";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { formatEGPFromCents } from "@/lib/money";
import { ProductCard } from "@/components/product/ProductCard";
import { HomeStoryBlocks } from "@/components/home/HomeStoryBlocks";
import { parseHomeStoryBlocks } from "@/lib/home-story-blocks";
import type { ReactNode } from "react";

const productInclude = {
  media: { where: { type: "IMAGE" as const }, orderBy: { sortOrder: "asc" as const }, take: 1 },
  variants: {
    where: { enabled: true },
    orderBy: { priceCents: "asc" as const },
    take: 1,
  },
} as const;

function ProductRail({
  title,
  subtitle,
  ctaHref,
  ctaLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  ctaHref: string;
  ctaLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
        <Link
          href={ctaHref}
          className="text-sm text-[var(--color-brand-muted)] underline-offset-4 hover:text-[var(--color-brand-ink)] hover:underline"
        >
          {ctaLabel}
        </Link>
      </div>
      {subtitle ? (
        <p className="-mt-2 max-w-2xl text-sm text-[var(--color-brand-muted)]">
          {subtitle}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const [storyRow, featured, newArrivals] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: "home_story_blocks" } }),
    prisma.product.findMany({
      where: { published: true, featured: true },
      include: productInclude,
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.product.findMany({
      where: { published: true },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const storyBlocks = parseHomeStoryBlocks(storyRow?.value);

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16 md:gap-24 md:py-24">
      <div className="max-w-3xl space-y-8">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-brand-muted)]">
          Furniture atelier
        </p>
        <h1 className="font-display text-4xl leading-tight md:text-6xl md:leading-[1.05]">
          {t("hero")}
        </h1>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/shop"
            className="rounded-full bg-[var(--color-brand-ink)] px-8 py-3 text-sm font-medium text-[var(--color-brand-primary)] transition hover:opacity-90"
          >
            {t("ctaShop")}
          </Link>
          <Link
            href="/backstage"
            className="rounded-full border border-black/10 bg-white px-8 py-3 text-sm font-medium text-[var(--color-brand-ink)] transition hover:border-black/20"
          >
            {t("ctaBackstage")}
          </Link>
        </div>
      </div>

      {storyBlocks.length > 0 ? (
        <HomeStoryBlocks blocks={storyBlocks} locale={locale} />
      ) : null}

      {featured.length > 0 ? (
        <ProductRail
          title={t("featured")}
          ctaHref="/shop"
          ctaLabel={t("featuredShopAll")}
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => {
              const img = p.media[0];
              const title = locale === "ar" ? p.titleAr : p.titleEn;
              const from = p.variants[0]?.priceCents ?? 0;
              return (
                <ProductCard
                  key={p.id}
                  slug={p.slug}
                  title={title}
                  imageUrl={img?.url ?? null}
                  imageAlt={
                    (locale === "ar" ? img?.altAr : img?.altEn) ?? title ?? ""
                  }
                  priceLine={`${t("featuredFrom")} ${formatEGPFromCents(from, locale)}`}
                  imageSizes="(max-width:1024px) 50vw, 33vw"
                  density="compact"
                />
              );
            })}
          </div>
        </ProductRail>
      ) : null}

      {newArrivals.length > 0 ? (
        <ProductRail
          title={t("newArrivals")}
          subtitle={t("newArrivalsSubtitle")}
          ctaHref="/shop"
          ctaLabel={t("featuredShopAll")}
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newArrivals.map((p) => {
              const img = p.media[0];
              const title = locale === "ar" ? p.titleAr : p.titleEn;
              const from = p.variants[0]?.priceCents ?? 0;
              return (
                <ProductCard
                  key={p.id}
                  slug={p.slug}
                  title={title}
                  imageUrl={img?.url ?? null}
                  imageAlt={
                    (locale === "ar" ? img?.altAr : img?.altEn) ?? title ?? ""
                  }
                  priceLine={`${t("featuredFrom")} ${formatEGPFromCents(from, locale)}`}
                  imageSizes="(max-width:1024px) 50vw, 33vw"
                  density="compact"
                />
              );
            })}
          </div>
        </ProductRail>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Aura filters",
            body: "Category, material, color, size — tuned for how you actually choose seating.",
          },
          {
            title: "Made-stage timeline",
            body: "From placed to warranty — your order has a clear production story.",
          },
          {
            title: "Warm neutral palette",
            body: "Anchored in #f5e8dd with generous negative space.",
          },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-black/5 bg-white/80 p-8 shadow-sm backdrop-blur"
          >
            <h3 className="font-display text-xl">{c.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-brand-muted)]">
              {c.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
