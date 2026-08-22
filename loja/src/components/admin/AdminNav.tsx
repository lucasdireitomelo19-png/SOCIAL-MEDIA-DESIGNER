"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/pedidos", label: "Pedidos" },
];

export function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-b border-stone-200 bg-white px-4 py-4 sm:w-56 sm:border-b-0 sm:border-r sm:px-4 sm:py-6">
      <div>
        <Link href="/admin" className="block text-lg font-semibold text-stone-900">
          Brechó · Admin
        </Link>
        <nav className="mt-6 flex gap-1 sm:flex-col">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-6 flex items-center justify-between gap-2 sm:flex-col sm:items-stretch">
        <p className="truncate text-xs text-stone-500">{userName}</p>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100"
          >
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
