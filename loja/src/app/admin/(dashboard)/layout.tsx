import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 sm:flex-row">
      <AdminNav userName={session.user?.name ?? session.user?.email ?? "Admin"} />
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
