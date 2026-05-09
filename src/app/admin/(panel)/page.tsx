import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export default async function AdminHomePage() {
  const [products, orders, articles, projects, customers] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.backstageArticle.count(),
    prisma.interiorProject.count(),
    prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
  ]);

  const cards = [
    {
      label: "Products",
      value: products,
      href: "/admin/products",
      hint: "Catalog · variants",
    },
    {
      label: "Orders",
      value: orders,
      href: "/admin/orders",
      hint: "Fulfillment",
    },
    {
      label: "Customers",
      value: customers,
      href: "/admin/customers",
      hint: "Accounts",
    },
    {
      label: "Articles",
      value: articles,
      href: "/admin/content",
      hint: "Backstage + quiz",
    },
    {
      label: "Projects",
      value: projects,
      href: "/admin/projects",
      hint: "Interior gallery",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-black/50">
          Overview of your store and content. Use the sidebar to dive deeper.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-2xl border border-black/8 bg-white p-6 shadow-sm transition hover:border-black/15 hover:shadow-md"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-black/40">
              {c.label}
            </p>
            <p className="mt-2 font-display text-4xl tabular-nums">{c.value}</p>
            <p className="mt-2 text-sm text-black/45">{c.hint}</p>
            <span className="mt-4 inline-flex text-sm font-medium text-[#1a1814] group-hover:underline">
              Open →
            </span>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-black/70">Quick links</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {[
            ["/admin/categories", "Categories"],
            ["/admin/facets", "Facets"],
            ["/admin/shipping", "Shipping"],
            ["/admin/settings", "Settings"],
            ["/admin/audit", "Audit log"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border border-black/10 bg-black/[0.02] px-4 py-2 hover:bg-black/[0.06]"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
