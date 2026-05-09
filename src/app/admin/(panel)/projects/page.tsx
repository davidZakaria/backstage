import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminProjectsPage() {
  const projects = await prisma.interiorProject.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    include: { _count: { select: { media: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-black/45">
            Content
          </p>
          <h1 className="font-display text-3xl">Interior projects</h1>
          <p className="mt-1 max-w-xl text-sm text-black/50">
            Jura gallery — matches storefront{" "}
            <Link href="/en/projects" className="underline underline-offset-2">
              /projects
            </Link>
            .
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-full bg-[#1a1814] px-5 py-2.5 text-sm font-medium text-[#f5e8dd]"
        >
          New project
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/8 bg-black/[0.02] text-black/50">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Title (EN)</th>
              <th className="px-4 py-3 font-medium">Images</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-black/45">
                  No projects yet. Create one for the gallery.
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3 tabular-nums text-black/60">{p.sortOrder}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.slug}</td>
                  <td className="px-4 py-3 font-medium">{p.titleEn}</td>
                  <td className="px-4 py-3 text-black/60">{p._count.media}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        p.published
                          ? "bg-emerald-500/15 text-emerald-900"
                          : "bg-amber-500/15 text-amber-900",
                      ].join(" ")}
                    >
                      {p.published ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="font-medium text-[#1a1814] underline-offset-2 hover:underline"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/en/projects/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ms-3 text-black/45 hover:text-black"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
