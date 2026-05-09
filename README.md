# Backstage

Bilingual (English / Arabic) **furniture e-commerce** storefront, customer area, and **JWT-protected admin** back office — Next.js App Router, Prisma, PostgreSQL, next-intl (RTL), Supabase Storage.

## Features

**Storefront**

- Shop with Aura-style filters (category, material, color, size, price).
- Product detail with image zoom, optional video, SEO metadata / JSON-LD.
- Cart (Zustand) + checkout with shipping zones and cash-on-delivery when enabled in site settings.
- Brand content: articles, interior projects gallery, Mix & Match quiz.
- Signed-in **My Stage**: orders, wishlist, addresses; optional GTM / GA4 / Clarity.

**Admin (`/admin`)**

- Catalog: categories, facets, products, variants, inventory.
- Media: URLs or upload (Supabase / Cloudinary when configured).
- Orders: status state machine + history; customers; content; shipping; site settings; audit log.

**Architecture notes**

- Locales live in the URL (`/en`, `/ar`); admin stays **unprefixed** (`/admin`) for predictable middleware and links.
- Prisma `directUrl` is intended for session/direct connections (e.g. Supabase pooler) while `DATABASE_URL` can use the transaction pooler for the app.

## Requirements

- Node.js 20+
- PostgreSQL (local or hosted; see `.env.example` for Supabase-oriented URLs)

## Setup

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL, DIRECT_URL, AUTH_SECRET, and optional Supabase keys.

npm install
npx prisma db push
npm run db:seed   # optional sample data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (after creating an admin user per your seed/auth flow).

## Scripts

| Script          | Description                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Next.js development server           |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Production server                    |
| `npm run lint`  | ESLint                               |
| `npm run db:push` | Push schema to DB (dev)           |
| `npm run db:migrate` | Prisma migrations              |
| `npm run db:seed`    | Seed database                  |
| `npm run db:studio`  | Prisma Studio                  |

Full environment variable reference: **`.env.example`**.

## Design references

Storefront UX direction (editorial home, category IA, product display) is summarized in **[`docs/design-references.md`](docs/design-references.md)** — IKEA, Efreshli, and Saloni as pattern references only, not branding.

## Tech stack

Next.js 16 · React 19 · TypeScript · Prisma 6 · PostgreSQL · Tailwind 4 · next-intl · TanStack Query · Zustand · Supabase client · Jose (JWT) · Zod
