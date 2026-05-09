"use client";

import { useCartStore } from "@/lib/cart/store";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { useMemo } from "react";

export type SiteHeaderCategory = {
  slug: string;
  nameEn: string;
  nameAr: string;
};

export function SiteHeader({
  locale,
  categories = [],
}: {
  locale: string;
  categories?: SiteHeaderCategory[];
}) {
  const t = useTranslations("nav");
  const tc = useTranslations("contact");
  const pathname = usePathname();
  const lines = useCartStore((s) => s.lines);
  const count = useMemo(
    () => lines.reduce((a, l) => a + l.quantity, 0),
    [lines],
  );

  const otherLocale = locale === "ar" ? "en" : "ar";

  const restLinks = (
    <>
      <Link href="/backstage" className="hover:text-black">
        {t("backstage")}
      </Link>
      <Link href="/projects" className="hover:text-black">
        {t("projects")}
      </Link>
      <Link href="/mix-match" className="hover:text-black">
        {t("mixMatch")}
      </Link>
      <Link href="/my-stage" className="hover:text-black">
        {t("myStage")}
      </Link>
      <Link href="/contact" className="hover:text-black">
        {tc("title")}
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[var(--color-brand-canvas)]/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-display text-xl tracking-tight text-[var(--color-brand-ink)]"
          >
            Backstage
          </Link>

          <nav
            className="hidden flex-wrap items-center gap-x-6 gap-y-2 text-sm md:flex"
            aria-label="Primary"
          >
            <div className="group relative">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-black/[0.04]"
              >
                {t("shop")}
                {categories.length > 0 ? (
                  <span className="text-[0.65rem] opacity-50" aria-hidden>
                    ▾
                  </span>
                ) : null}
              </Link>
              {categories.length > 0 ? (
                <div
                  role="menu"
                  className="pointer-events-none invisible absolute start-0 top-full z-50 mt-1 max-h-[min(70vh,22rem)] w-56 origin-top scale-95 overflow-y-auto rounded-xl border border-black/10 bg-[var(--color-brand-canvas)] py-2 opacity-0 shadow-lg transition duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:scale-100 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:scale-100 group-focus-within:opacity-100"
                >
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      role="menuitem"
                      href={`/shop?category=${encodeURIComponent(c.slug)}`}
                      className="block px-4 py-2 text-[var(--color-brand-ink)] hover:bg-black/[0.04]"
                    >
                      {locale === "ar" ? c.nameAr : c.nameEn}
                    </Link>
                  ))}
                  <div className="mt-1 border-t border-black/5 pt-1">
                    <Link
                      href="/shop"
                      role="menuitem"
                      className="block px-4 py-2 text-xs font-medium text-[var(--color-brand-muted)] hover:text-[var(--color-brand-ink)]"
                    >
                      {t("shopAll")}
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
            {restLinks}
          </nav>

          <div className="flex shrink-0 items-center gap-3 text-sm">
            <Link
              href={pathname ?? "/"}
              locale={otherLocale}
              className="rounded-full border border-black/10 px-3 py-1 text-xs uppercase tracking-wide hover:border-black/20"
              hrefLang={otherLocale}
            >
              {otherLocale === "ar" ? "ع" : "EN"}
            </Link>
            <Link
              href="/cart"
              className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-medium text-[var(--color-brand-ink)]"
            >
              {t("cart")}{" "}
              {count > 0 ? (
                <span className="ms-1 rounded-full bg-black/10 px-2 py-0.5">
                  {count}
                </span>
              ) : null}
            </Link>
            <Link href="/login" className="hidden sm:inline hover:underline">
              {t("login")}
            </Link>
            <NextLink
              href="/admin"
              className="hidden text-[var(--color-brand-muted)] hover:text-black lg:inline"
              prefetch={false}
            >
              {t("admin")}
            </NextLink>
          </div>
        </div>

        <nav
          className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-black/5 pt-3 text-sm md:hidden"
          aria-label="Primary mobile"
        >
          <Link href="/shop" className="font-medium hover:text-black">
            {t("shop")}
          </Link>
          {restLinks}
        </nav>
      </div>
    </header>
  );
}
