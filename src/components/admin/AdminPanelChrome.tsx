"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { href: string; label: string; match?: string };

type NavGroup = { label: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", match: "^/admin$" }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/facets", label: "Facets" },
      { href: "/admin/products", label: "Products" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/customers", label: "Customers" },
      { href: "/admin/shipping", label: "Shipping" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/content", label: "Articles & quiz" },
      { href: "/admin/projects", label: "Interior projects" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/audit", label: "Audit log" },
    ],
  },
];

function navActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  if (item.match) {
    const re = new RegExp(item.match);
    return re.test(pathname);
  }
  if (item.href === "/admin") return pathname === "/admin";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AdminPanelChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebarInner = (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 px-4 md:h-16">
        <span className="font-display text-lg tracking-tight text-white">
          Backstage Admin
        </span>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto p-4" aria-label="Admin">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = navActive(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={[
                        "block rounded-lg px-3 py-2 text-sm transition",
                        active
                          ? "bg-white/12 font-medium text-white"
                          : "text-stone-300 hover:bg-white/5 hover:text-white",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div className="border-t border-white/10 pt-4">
          <Link
            href="/en"
            className="block rounded-lg px-3 py-2 text-sm text-amber-200/90 hover:bg-white/5"
          >
            View storefront →
          </Link>
        </div>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-[#ece8e0] text-[#1a1814]">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-black/10 bg-[#1a1814] px-4 text-white md:hidden">
        <span className="font-display text-base">Admin</span>
        <button
          type="button"
          className="rounded-lg border border-white/20 px-3 py-1.5 text-sm"
          aria-expanded={open}
          aria-controls="admin-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>

      <div
        className={[
          "fixed inset-0 top-14 z-30 bg-black/40 transition-opacity md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <div className="flex min-h-[calc(100dvh-3.5rem)] md:min-h-screen">
        <aside
          id="admin-drawer"
          className={[
            "z-40 flex w-64 shrink-0 flex-col bg-[#1a1814] transition-transform duration-200",
            "fixed bottom-0 start-0 top-14 md:sticky md:top-0 md:h-screen md:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          ].join(" ")}
        >
          {sidebarInner}
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
