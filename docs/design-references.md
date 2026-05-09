# Storefront design references (Backstage)

We use three public sites as **UX pattern references only**. We do **not** copy their branding, logos, photography, trademarks, or layouts pixel-for-pixel.

| Reference | URL | What we borrow |
|-----------|-----|----------------|
| IKEA | [ikea.com](https://www.ikea.com/) | Editorial **story blocks**: large imagery, headline, single CTA, repeatable modules; seasonal/collection storytelling on the home page—not only product grids. |
| Efreshli | [efreshli.com](https://efreshli.com/) | **Information architecture**: Shop as the primary path; category-led navigation; curated rails (featured, new arrivals, room/category); clear hierarchy between shopping and content. |
| Saloni Furniture | [saloni.furniture](https://saloni.furniture/) | **Product display**: image-first cards, consistent aspect ratios, minimal chrome on listings; PDP focus on **large imagery** and clear variant selection. |

## What we never copy

- Logos, wordmarks, and trade dress of IKEA, Efreshli, Saloni, or others.
- Proprietary imagery, copy, or exact section order from those sites.
- Any behavior that implies endorsement or affiliation.

## How this maps in the codebase

| Pattern | Where |
|--------|--------|
| Editorial strips | Home: `SiteSetting` key `home_story_blocks` (JSON) + [`page.tsx`](../src/app/[locale]/page.tsx) |
| Category Shop menu | [`SiteHeader.tsx`](../src/components/SiteHeader.tsx) + categories from Prisma |
| Curated rails | Home: featured + new arrivals queries in [`page.tsx`](../src/app/[locale]/page.tsx) |
| Listing / PDP gallery | [`ProductCard`](../src/components/product/ProductCard.tsx), [`ProductImageGallery.tsx`](../src/components/product/ProductImageGallery.tsx) |

## `home_story_blocks` JSON shape

Admin **Settings** includes a JSON field for this key. Example:

```json
[
  {
    "kickerEn": "Collection",
    "kickerAr": "تشكيلة",
    "titleEn": "Warm neutrals for open plans",
    "titleAr": "درجات دافئة للمساحات المفتوحة",
    "bodyEn": "Curated seating and tables in oak and linen tones.",
    "bodyAr": "مقاعد وطاولات مختارة بدرجات البلوط والكتان.",
    "imageUrl": "https://example.com/image.jpg",
    "href": "/shop",
    "ctaEn": "Explore",
    "ctaAr": "استكشف"
  }
]
```

All fields except `imageUrl` and `href` are optional; invalid JSON or missing setting is ignored safely.
