import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatEGPFromCents } from "@/lib/money";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, published: true },
  });
  if (!product) return {};
  const title = locale === "ar" ? product.metaTitleAr : product.metaTitleEn;
  const desc =
    locale === "ar" ? product.metaDescriptionAr : product.metaDescriptionEn;
  return {
    title: title ?? (locale === "ar" ? product.titleAr : product.titleEn),
    description: desc ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product");

  const product = await prisma.product.findFirst({
    where: { slug, published: true },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      variants: {
        where: { enabled: true },
        include: {
          material: true,
          color: true,
          size: true,
          inventory: true,
        },
        orderBy: { priceCents: "asc" },
      },
    },
  });

  if (!product) notFound();

  const title = locale === "ar" ? product.titleAr : product.titleEn;
  const description =
    locale === "ar" ? product.descriptionAr : product.descriptionEn;
  const images = product.media.filter((m) => m.type === "IMAGE");
  const vid = product.media.find((m) => m.type === "VIDEO");
  const cartImageUrl = images[0]?.url ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description,
    image: images.map((i) => i.url),
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      priceCurrency: "EGP",
      price: (v.priceCents / 100).toFixed(2),
      availability:
        (v.inventory?.quantityOnHand ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-12 lg:grid-cols-2">
        <ProductImageGallery
          locale={locale}
          title={title}
          images={images}
          video={vid}
        />
        <div className="space-y-6">
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            {title}
          </h1>
          <p className="text-[var(--color-brand-muted)]">{description}</p>
          <ProductPurchasePanel
            locale={locale}
            productSlug={product.slug}
            productTitle={title}
            variants={product.variants}
            imageUrl={cartImageUrl}
          />
          <p className="text-xs text-[var(--color-brand-muted)]">
            {t("from")}:{" "}
            {formatEGPFromCents(product.variants[0]?.priceCents ?? 0, locale)}
          </p>
        </div>
      </div>
    </>
  );
}
