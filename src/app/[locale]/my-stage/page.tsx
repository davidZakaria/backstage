import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { formatEGPFromCents } from "@/lib/money";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default async function MyStagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getSession();
  if (!session) redirect(`/${locale}/login`);
  const t = await getTranslations("myStage");
  const tn = await getTranslations("nav");

  const [orders, wishlist, addresses] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      include: {
        statusHistory: { orderBy: { createdAt: "asc" } },
        lines: { include: { variant: { include: { product: true } } } },
      },
    }),
    prisma.wishlistItem.findMany({
      where: { userId: session.sub },
      include: { product: true },
    }),
    prisma.address.findMany({ where: { userId: session.sub } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl">{t("title")}</h1>
        <LogoutButton label={tn("logout")} locale={locale} />
      </div>
      <section>
        <h2 className="font-display text-2xl">{t("orders")}</h2>
        <ul className="mt-4 space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl border border-black/5 bg-white p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-mono text-xs">{o.id.slice(0, 12)}…</span>
                <span>{o.status}</span>
                <span>{formatEGPFromCents(o.totalCents, locale)}</span>
              </div>
              <ul className="mt-2 text-[var(--color-brand-muted)]">
                {o.lines.map((l) => (
                  <li key={l.id}>
                    {locale === "ar"
                      ? l.variant.product.titleAr
                      : l.variant.product.titleEn}{" "}
                    × {l.quantity}
                  </li>
                ))}
              </ul>
              <details className="mt-2">
                <summary className="cursor-pointer text-xs">Timeline</summary>
                <ol className="mt-2 list-decimal ps-4 text-xs">
                  {o.statusHistory.map((h) => (
                    <li key={h.id}>
                      {h.fromStatus ?? "—"} → {h.toStatus} ·{" "}
                      {h.createdAt.toISOString().slice(0, 10)}
                    </li>
                  ))}
                </ol>
              </details>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-2xl">{t("wishlist")}</h2>
        {wishlist.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--color-brand-muted)]">Empty.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {wishlist.map((w) => (
              <li key={w.productId} className="rounded-xl border border-black/5 bg-white p-3">
                <Link href={`/${locale}/product/${w.product.slug}`}>
                  {locale === "ar" ? w.product.titleAr : w.product.titleEn}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="font-display text-2xl">{t("addresses")}</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {addresses.map((a) => (
            <li key={a.id} className="rounded-xl border border-black/5 bg-white p-3">
              {a.line1}, {a.city} · {a.phone}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
