import { prisma } from "@/lib/prisma";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatEGPFromCents } from "@/lib/money";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ProductCard } from "@/components/product/ProductCard";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("shop");
  const tp = await getTranslations("product");

  const categorySlug =
    typeof sp.category === "string" ? sp.category : undefined;
  const materialSlug =
    typeof sp.material === "string" ? sp.material : undefined;
  const colorSlug = typeof sp.color === "string" ? sp.color : undefined;
  const sizeSlug = typeof sp.size === "string" ? sp.size : undefined;
  const priceMin =
    typeof sp.priceMin === "string" ? parseInt(sp.priceMin, 10) : undefined;
  const priceMax =
    typeof sp.priceMax === "string" ? parseInt(sp.priceMax, 10) : undefined;

  const products = await prisma.product.findMany({
    where: {
      published: true,
      ...(categorySlug
        ? {
            categories: {
              some: { category: { slug: categorySlug } },
            },
          }
        : {}),
      variants: {
        some: {
          enabled: true,
          ...(materialSlug ? { material: { slug: materialSlug } } : {}),
          ...(colorSlug ? { color: { slug: colorSlug } } : {}),
          ...(sizeSlug ? { size: { slug: sizeSlug } } : {}),
          ...(priceMin != null && !Number.isNaN(priceMin)
            ? { priceCents: { gte: priceMin } }
            : {}),
          ...(priceMax != null && !Number.isNaN(priceMax)
            ? { priceCents: { lte: priceMax } }
            : {}),
        },
      },
    },
    include: {
      media: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: {
        where: { enabled: true },
        orderBy: { priceCents: "asc" },
        take: 1,
        include: { inventory: true },
      },
    },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  });

  const [categories, materials, colors, sizes] = await Promise.all([
    prisma.category.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.material.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.color.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.size.findMany({ orderBy: { nameEn: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-10 md:flex-row">
        <aside className="md:w-64">
          <ShopFilters
            locale={locale}
            categories={categories}
            materials={materials}
            colors={colors}
            sizes={sizes}
            initial={{
              category: categorySlug,
              material: materialSlug,
              color: colorSlug,
              size: sizeSlug,
              priceMin: priceMin?.toString(),
              priceMax: priceMax?.toString(),
            }}
          />
        </aside>
        <div className="flex-1">
          <h1 className="font-display text-4xl">{t("title")}</h1>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.length === 0 ? (
              <p className="text-[var(--color-brand-muted)]">{t("empty")}</p>
            ) : (
              products.map((p) => {
                const img = p.media[0];
                const v0 = p.variants[0];
                const title = locale === "ar" ? p.titleAr : p.titleEn;
                const stock = v0?.inventory?.quantityOnHand ?? 0;
                const priceLine = v0
                  ? `${t("filterPrice")}: ${formatEGPFromCents(v0.priceCents, locale)}${
                      stock <= 0 ? ` · ${tp("outOfStock")}` : ""
                    }`
                  : "";
                return (
                  <ProductCard
                    key={p.id}
                    slug={p.slug}
                    title={title}
                    imageUrl={img?.url ?? null}
                    imageAlt={
                      (locale === "ar" ? img?.altAr : img?.altEn) ?? title ?? ""
                    }
                    priceLine={priceLine}
                    imageSizes="(max-width:1024px) 50vw, 33vw"
                    density="comfortable"
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
