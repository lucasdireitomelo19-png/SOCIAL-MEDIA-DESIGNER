"use client";

import Link from "next/link";
import { useCartStore, cartCount } from "@/lib/cart-store";
import { useHasMounted } from "@/lib/use-has-mounted";

export function Header() {
  const items = useCartStore((state) => state.items);
  const mounted = useHasMounted();

  const count = mounted ? cartCount(items) : 0;

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-stone-900">
          Brechó Online
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-stone-600 sm:gap-6">
          <Link href="/produtos" className="hover:text-stone-900">
            Produtos
          </Link>
          <Link
            href="/carrinho"
            className="relative flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-stone-900 hover:bg-stone-100"
          >
            Carrinho
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1 text-xs font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
