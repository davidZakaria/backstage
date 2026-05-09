import { AdminPanelChrome } from "@/components/admin/AdminPanelChrome";

export const dynamic = "force-dynamic";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminPanelChrome>{children}</AdminPanelChrome>;
}
