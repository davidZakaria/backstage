import { prisma } from "@/lib/prisma";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { TransparencySection } from "@/components/backstage/TransparencySection";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "backstage" });
  return { title: t("title") };
}

export default async function BackstagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const articles = await prisma.backstageArticle.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { media: { orderBy: { sortOrder: "asc" } } },
  });
  const t = await getTranslations("backstage");

  return (
    <div className="mx-auto max-w-3xl space-y-16 px-6 py-16">
      <h1 className="font-display text-5xl">{t("title")}</h1>
      {articles.map((a) => {
        const title = locale === "ar" ? a.titleAr : a.titleEn;
        const body = locale === "ar" ? a.bodyAr : a.bodyEn;
        return (
          <TransparencySection key={a.id} title={title} body={body} media={a.media} locale={locale} />
        );
      })}
    </div>
  );
}
