import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProjectWorkspace } from "@/components/admin/ProjectWorkspace";

export default async function AdminProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.interiorProject.findUnique({
    where: { id },
    include: { media: { orderBy: { sortOrder: "asc" } } },
  });
  if (!project) notFound();

  return <ProjectWorkspace project={project} />;
}
