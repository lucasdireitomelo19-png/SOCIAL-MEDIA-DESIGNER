import { verifyAdminSession } from "@/lib/auth/dal";
import AdminSidebar from "@/components/admin/sidebar";

// Painel logado: nunca deve ser pré-renderizado/cacheado (sessão e dados mudam por request).
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdminSession();

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 md:flex-row">
      <AdminSidebar adminName={session.name} />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
