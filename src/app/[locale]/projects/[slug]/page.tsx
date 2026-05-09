import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Image from "next/image";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = await prisma.interiorProject.findFirst({
    where: { slug, published: true },
    include: { media: { orderBy: { sortOrder: "asc" } } },
  });
  if (!p) notFound();
  const title = locale === "ar" ? p.titleAr : p.titleEn;
  const body = locale === "ar" ? p.bodyAr : p.bodyEn;
  return (
    <article className="mx-auto max-w-4xl space-y-8 px-6 py-16">
      <h1 className="font-display text-5xl">{title}</h1>
      <p className="text-[var(--color-brand-muted)]">{body}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {p.media.map((m) => (
          <div key={m.id} className="relative aspect-square overflow-hidden rounded-xl bg-[var(--color-brand-primary)]/20">
            <Image
              src={m.url}
              alt={(locale === "ar" ? m.altAr : m.altEn) ?? title}
              fill
              className="object-cover"
              sizes="500px"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </article>
  );
}
