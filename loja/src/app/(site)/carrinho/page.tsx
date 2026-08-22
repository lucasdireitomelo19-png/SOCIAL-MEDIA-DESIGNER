"use client";

import Link from "next/link";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { useHasMounted } from "@/lib/use-has-mounted";

export default function CartPage() {
  const { items, removeItem, setQuantity } = useCartStore();
  const mounted = useHasMounted();

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-stone-900">Seu carrinho está vazio</h1>
        <Link
          href="/produtos"
          className="mt-4 inline-block rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-stone-900">Carrinho</h1>

      <ul className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 py-4">
            <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-stone-100">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1">
              <Link href={`/produtos/${item.slug}`} className="text-sm font-medium text-stone-900 hover:underline">
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-stone-500">{formatMoney(item.price)}</p>
              <div className="mt-2 flex items-center gap-2">
                <select
                  value={item.quantity}
                  onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                  className="rounded-md border border-stone-300 px-2 py-1 text-sm"
                >
                  {Array.from({ length: item.stock }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-xs font-medium text-stone-400 hover:text-red-600"
                >
                  Remover
                </button>
              </div>
            </div>
            <p className="text-sm font-semibold text-stone-900">
              {formatMoney(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-base font-medium text-stone-700">Total</span>
        <span className="text-xl font-semibold text-stone-900">
          {formatMoney(cartTotal(items))}
        </span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block w-full rounded-md bg-stone-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-stone-700"
      >
        Finalizar pedido
      </Link>
    </div>
  );
}
