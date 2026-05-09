"use client";

import type {
  Category,
  Color,
  Inventory,
  Material,
  Media,
  Product,
  ProductCategory,
  ProductVariant,
  Size,
} from "@prisma/client";
import { MediaType } from "@prisma/client";
import { ProductEditForm } from "@/components/admin/ProductEditForm";
import { useRouter } from "next/navigation";
import { useState } from "react";

type VariantRow = ProductVariant & {
  material: Material;
  color: Color;
  size: Size;
  inventory: Inventory | null;
};

type Assignment = ProductCategory & { category: Category };

type ProductFull = Product & {
  categories: Assignment[];
  variants: VariantRow[];
  media: Media[];
};

export function ProductWorkspace({
  product,
  allCategories,
  materials,
  colors,
  sizes,
}: {
  product: ProductFull;
  allCategories: Category[];
  materials: Material[];
  colors: Color[];
  sizes: Size[];
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);

  const assignedIds = new Set(product.categories.map((c) => c.categoryId));

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-6">
        <h2 className="font-display text-xl">Core</h2>
        <ProductEditForm product={product} allCategories={allCategories} />
      </div>

      <div className="space-y-6">
        <h2 className="font-display text-xl">Categories</h2>
        <ul className="space-y-2 text-sm">
          {allCategories.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2">
              <span>
                {c.nameEn} / {c.nameAr}
              </span>
              {assignedIds.has(c.id) ? (
                <button
                  type="button"
                  className="text-xs text-red-700"
                  onClick={async () => {
                    await fetch(
                      `/api/admin/products/${product.id}/categories?categoryId=${c.id}`,
                      { method: "DELETE" },
                    );
                    router.refresh();
                  }}
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  className="text-xs text-blue-700"
                  onClick={async () => {
                    await fetch(`/api/admin/products/${product.id}/categories`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ categoryId: c.id }),
                    });
                    router.refresh();
                  }}
                >
                  Add
                </button>
              )}
            </li>
          ))}
        </ul>

        <h2 className="font-display text-xl">Variants &amp; stock</h2>
        <form
          className="space-y-2 rounded border border-black/10 bg-white p-3 text-xs"
          onSubmit={async (e) => {
            e.preventDefault();
            setMsg(null);
            const fd = new FormData(e.currentTarget);
            const r = await fetch(`/api/admin/products/${product.id}/variants`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sku: fd.get("sku"),
                materialId: fd.get("materialId"),
                colorId: fd.get("colorId"),
                sizeId: fd.get("sizeId"),
                priceCents: parseInt(String(fd.get("priceCents")), 10),
                initialStock: parseInt(String(fd.get("initialStock") || "0"), 10),
              }),
            });
            const j = await r.json();
            if (!r.ok) setMsg(j.error ?? "Failed");
            else {
              (e.target as HTMLFormElement).reset();
              router.refresh();
            }
          }}
        >
          <p className="font-medium">New variant</p>
          <input name="sku" required placeholder="SKU" className="w-full rounded border px-2 py-1" />
          <div className="grid grid-cols-3 gap-2">
            <select name="materialId" required className="rounded border px-1 py-1">
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nameEn}
                </option>
              ))}
            </select>
            <select name="colorId" required className="rounded border px-1 py-1">
              {colors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nameEn}
                </option>
              ))}
            </select>
            <select name="sizeId" required className="rounded border px-1 py-1">
              {sizes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nameEn}
                </option>
              ))}
            </select>
          </div>
          <input
            name="priceCents"
            type="number"
            required
            placeholder="Price cents"
            className="w-full rounded border px-2 py-1"
          />
          <input
            name="initialStock"
            type="number"
            placeholder="Initial stock"
            className="w-full rounded border px-2 py-1"
          />
          <button type="submit" className="rounded bg-black px-3 py-1 text-[#f5e8dd]">
            Add variant
          </button>
        </form>
        {msg ? <p className="text-xs text-red-700">{msg}</p> : null}

        <ul className="space-y-3 text-sm">
          {product.variants.map((v) => (
            <li key={v.id} className="rounded border border-black/10 bg-white p-3">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-mono text-xs">{v.sku}</span>
                <span>
                  {v.material.nameEn} · {v.color.nameEn} · {v.size.nameEn}
                </span>
              </div>
              <p className="mt-1 text-xs">Price: {v.priceCents} cents · enabled: {String(v.enabled)}</p>
              <form
                className="mt-2 flex flex-wrap gap-2 text-xs"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  await fetch(`/api/admin/inventory/${v.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      quantityOnHand: parseInt(String(fd.get("qty")), 10),
                      reason: fd.get("reason"),
                    }),
                  });
                  router.refresh();
                }}
              >
                <input type="hidden" name="_v" value={v.id} />
                <label className="flex items-center gap-1">
                  Stock
                  <input
                    name="qty"
                    defaultValue={v.inventory?.quantityOnHand ?? 0}
                    type="number"
                    className="w-20 rounded border px-1"
                  />
                </label>
                <input name="reason" placeholder="reason" className="rounded border px-1" />
                <button type="submit" className="rounded border px-2">
                  Save stock
                </button>
              </form>
            </li>
          ))}
        </ul>

        <h2 className="font-display text-xl">Media</h2>
        <form
          className="space-y-2 text-xs"
          onSubmit={async (e) => {
            e.preventDefault();
            const file = (e.currentTarget.elements.namedItem("file") as HTMLInputElement)
              .files?.[0];
            let url = String((e.currentTarget.elements.namedItem("url") as HTMLInputElement).value);
            if (file) {
              const up = new FormData();
              up.append("file", file);
              const ures = await fetch("/api/admin/upload", { method: "POST", body: up });
              const uj = await ures.json();
              if (!ures.ok) {
                setMsg(uj.error ?? "Upload failed");
                return;
              }
              url = uj.url;
            }
            if (!url) {
              setMsg("Provide a URL or file");
              return;
            }
            const type =
              String((e.currentTarget.elements.namedItem("type") as HTMLSelectElement).value) ===
              "VIDEO"
                ? MediaType.VIDEO
                : MediaType.IMAGE;
            await fetch("/api/admin/media", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: product.id,
                url,
                type,
                altEn: String((e.currentTarget.elements.namedItem("altEn") as HTMLInputElement).value),
                altAr: String((e.currentTarget.elements.namedItem("altAr") as HTMLInputElement).value),
              }),
            });
            (e.target as HTMLFormElement).reset();
            router.refresh();
          }}
        >
          <input name="url" placeholder="Image/video URL (or upload below)" className="w-full rounded border px-2 py-1" />
          <input name="file" type="file" accept="image/*,video/*" className="w-full text-xs" />
          <select name="type" className="rounded border px-2 py-1">
            <option value="IMAGE">IMAGE</option>
            <option value="VIDEO">VIDEO</option>
          </select>
          <input name="altEn" placeholder="alt EN" className="w-full rounded border px-2 py-1" />
          <input name="altAr" placeholder="alt AR" className="w-full rounded border px-2 py-1" />
          <button type="submit" className="rounded bg-black px-3 py-1 text-[#f5e8dd]">
            Add media
          </button>
        </form>

        <ul className="space-y-2 text-xs">
          {product.media.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded border px-2 py-1">
              <span className="truncate font-mono">{m.url.slice(0, 48)}…</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="rounded border px-1"
                  onClick={async () => {
                    const sorted = [...product.media].sort(
                      (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id),
                    );
                    const i = sorted.findIndex((x) => x.id === m.id);
                    if (i <= 0) return;
                    const order = sorted.map((x) => x.id);
                    [order[i - 1], order[i]] = [order[i], order[i - 1]];
                    await fetch("/api/admin/media/reorder", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        productId: product.id,
                        orderedIds: order,
                      }),
                    });
                    router.refresh();
                  }}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="rounded border px-1"
                  onClick={async () => {
                    await fetch(`/api/admin/media/${m.id}`, { method: "DELETE" });
                    router.refresh();
                  }}
                >
                  Del
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
