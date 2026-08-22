"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/format";
import { useHasMounted } from "@/lib/use-has-mounted";

export default function CartPage() {
  const mounted = useHasMounted();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-brand-dark">Sua sacola</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-brand-line py-16 text-center">
          <p className="text-sm text-neutral-500">Sua sacola está vazia.</p>
          <Link
            href="/produtos"
            className="mt-4 inline-block rounded-full bg-brand-dark px-6 py-2.5 text-sm font-medium text-white hover:bg-black"
          >
            Ver peças disponíveis
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-brand-line">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-4 py-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                </div>
                <div className="flex-1">
                  <Link href={`/produtos/${item.slug}`} className="text-sm font-medium text-brand-dark hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-xs text-neutral-500">Tam. {item.size}</p>
                </div>
                <p className="text-sm font-semibold text-brand-dark">{formatCurrency(item.price)}</p>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-xs text-neutral-400 hover:text-red-600"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between border-t border-brand-line pt-4">
            <span className="text-sm font-medium text-brand-dark">Subtotal</span>
            <span className="font-display text-xl font-semibold text-brand-dark">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="mt-6 block rounded-full bg-brand-dark px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-black"
          >
            Finalizar compra
          </Link>
        </>
      )}
    </div>
  );
}
