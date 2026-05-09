import Image from "next/image";
import { Link } from "@/i18n/routing";

export type ProductCardProps = {
  slug: string;
  title: string;
  imageUrl: string | null;
  imageAlt: string;
  /** Full line e.g. "From 1,200 EGP" or "Price: 1,200 EGP · Out of stock" */
  priceLine: string;
  /** Passed to next/image `sizes` for LCP tuning */
  imageSizes: string;
  /** `comfortable` = shop grid (larger type); `compact` = home rails */
  density?: "comfortable" | "compact";
};

/**
 * Shared listing tile — image-first, minimal chrome (Saloni-style showroom clarity).
 */
export function ProductCard({
  slug,
  title,
  imageUrl,
  imageAlt,
  priceLine,
  imageSizes,
  density = "comfortable",
}: ProductCardProps) {
  const pad = density === "comfortable" ? "p-6" : "p-5";
  const titleCls =
    density === "comfortable"
      ? "font-display text-xl tracking-tight text-[var(--color-brand-ink)]"
      : "font-display text-lg tracking-tight text-[var(--color-brand-ink)]";
  const TitleTag = density === "comfortable" ? "h2" : "h3";

  return (
    <Link
      href={`/product/${slug}`}
      className="group block overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_3px_rgba(28,25,23,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-12px_rgba(28,25,23,0.15)]"
    >
      <div className="relative aspect-[3/4] bg-[var(--color-brand-primary)]/25">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
            sizes={imageSizes}
          />
        ) : null}
      </div>
      <div className={`space-y-2 ${pad}`}>
        <TitleTag className={titleCls}>{title}</TitleTag>
        <p className="text-sm leading-relaxed text-[var(--color-brand-muted)]">
          {priceLine}
        </p>
      </div>
    </Link>
  );
}
