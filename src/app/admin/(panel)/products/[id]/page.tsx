import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductWorkspace } from "@/components/admin/ProductWorkspace";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, allCategories, materials, colors, sizes] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        variants: {
          include: { material: true, color: true, size: true, inventory: true },
          orderBy: { sku: "asc" },
        },
        media: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }] }),
    prisma.material.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.color.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.size.findMany({ orderBy: { nameEn: "asc" } }),
  ]);
  if (!product) notFound();
  return (
    <div className="space-y-6 p-8">
      <h1 className="font-display text-3xl">Edit product</h1>
      <ProductWorkspace
        product={product}
        allCategories={allCategories}
        materials={materials}
        colors={colors}
        sizes={sizes}
      />
    </div>
  );
}
