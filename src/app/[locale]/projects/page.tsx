import { prisma } from "@/lib/prisma";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return { title: t("title") };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const items = await prisma.interiorProject.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { media: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-5xl">{t("title")}</h1>
      <div className="mt-12 columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3">
        {items.map((p) => {
          const title = locale === "ar" ? p.titleAr : p.titleEn;
          const img = p.media[0];
          return (
            <Link
              key={p.id}
              href={`/${locale}/projects/${p.slug}`}
              className="block break-inside-avoid overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5"
            >
              {img ? (
                <div className="relative aspect-[3/4] bg-[var(--color-brand-primary)]/30">
                  <Image
                    src={img.url}
                    alt={(locale === "ar" ? img.altAr : img.altEn) ?? title}
                    fill
                    className="object-cover"
                    sizes="400px"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div className="p-4">
                <h2 className="font-display text-xl">{title}</h2>
                <p className="mt-2 text-xs text-[var(--color-brand-muted)]">{p.tags}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
