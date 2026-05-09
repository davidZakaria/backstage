import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/Providers";
import { SiteHeader } from "@/components/SiteHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "ar")) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  let categoryNav = await prisma.category.findMany({
    where: { published: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    take: 24,
  });
  if (categoryNav.length === 0) {
    categoryNav = await prisma.category.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      take: 20,
    });
  }
  const categories = categoryNav.map((c) => ({
    slug: c.slug,
    nameEn: c.nameEn,
    nameAr: c.nameAr,
  }));

  return (
    <Providers locale={locale} messages={messages as Record<string, unknown>}>
      <SiteHeader locale={locale} categories={categories} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-black/5 bg-[var(--color-brand-primary)]/40 px-6 py-10 text-sm text-[var(--color-brand-muted)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:justify-between">
          <span className="font-display text-base text-[var(--color-brand-ink)]">
            Backstage
          </span>
          <span>EGP · Cairo build · Transparent pricing</span>
        </div>
      </footer>
    </Providers>
  );
}
