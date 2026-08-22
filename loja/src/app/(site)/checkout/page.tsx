"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/format";
import { createOrder, type CheckoutState } from "@/actions/checkout-actions";
import { useHasMounted } from "@/lib/use-has-mounted";

export default function CheckoutPage() {
  const mounted = useHasMounted();
  const items = useCartStore((state) => state.items);
  const router = useRouter();
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(createOrder, undefined);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace("/carrinho");
    }
  }, [mounted, items.length, router]);

  if (!mounted || items.length === 0) return null;

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-brand-dark">Finalizar compra</h1>

      <div className="mt-6 rounded-2xl border border-brand-line bg-white p-5">
        <p className="text-sm font-medium text-brand-dark">Resumo</p>
        <ul className="mt-2 space-y-1 text-sm text-neutral-600">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between">
              <span>
                {item.name} (Tam. {item.size})
              </span>
              <span>{formatCurrency(item.price)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-brand-line pt-3 text-sm font-semibold text-brand-dark">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <input type="hidden" name="items" value={JSON.stringify(items.map((i) => ({ productId: i.productId })))} />

        <div>
          <h2 className="mb-3 text-sm font-semibold text-brand-dark">Seus dados</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input name="customerName" placeholder="Nome completo" required className="field sm:col-span-2" />
            <input name="customerEmail" type="email" placeholder="E-mail" required className="field" />
            <input name="customerPhone" placeholder="Telefone / WhatsApp" required className="field" />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-brand-dark">Endereço de entrega</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
            <input name="shippingZip" placeholder="CEP" required className="field sm:col-span-2" />
            <input name="shippingStreet" placeholder="Rua" required className="field sm:col-span-4" />
            <input name="shippingNumber" placeholder="Número" required className="field sm:col-span-2" />
            <input name="shippingComplement" placeholder="Complemento (opcional)" className="field sm:col-span-4" />
            <input name="shippingDistrict" placeholder="Bairro" required className="field sm:col-span-3" />
            <input name="shippingCity" placeholder="Cidade" required className="field sm:col-span-2" />
            <input name="shippingState" placeholder="UF" maxLength={2} required className="field sm:col-span-1 uppercase" />
          </div>
        </div>

        {state?.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand-dark px-6 py-3 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
        >
          {pending ? "Processando..." : "Ir para pagamento"}
        </button>
      </form>
    </div>
  );
}
