"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth-actions";
import { siteConfig } from "@/lib/site-config";

const links = [
  { href: "/admin", label: "Visão geral", exact: true },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/pedidos", label: "Pedidos" },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-b border-brand-line bg-brand-dark px-4 py-5 text-white md:h-screen md:w-60 md:border-b-0 md:border-r md:px-5 md:py-6">
      <div>
        <Link href="/admin" className="block font-display text-lg font-semibold">
          {siteConfig.shortName}
          <span className="ml-1.5 text-xs font-normal uppercase tracking-widest text-brand-accent">
            admin
          </span>
        </Link>
        <nav className="mt-8 flex gap-1 md:flex-col">
          {links.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-white text-brand-dark" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-6 flex items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-white/60 md:flex-col md:items-stretch">
        <p className="truncate">{adminName}</p>
        <form action={logout}>
          <button type="submit" className="text-white/70 underline-offset-2 hover:text-white hover:underline">
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
