"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useHasMounted } from "@/lib/use-has-mounted";

export default function CartIndicator() {
  const mounted = useHasMounted();
  const count = useCartStore((state) => state.items.length);

  return (
    <Link href="/carrinho" className="relative text-sm font-medium text-brand-dark hover:text-brand-accent">
      Sacola
      {mounted && count > 0 && (
        <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-accent px-1 text-xs font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
