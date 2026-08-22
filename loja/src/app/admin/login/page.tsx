import LoginForm from "./login-form";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-brand-accent">
          {siteConfig.shortName}
        </p>
        <h1 className="mt-2 text-center text-2xl font-semibold text-brand-dark">
          Painel administrativo
        </h1>
        <p className="mt-1 text-center text-sm text-neutral-500">
          Entre para gerenciar produtos e pedidos.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
