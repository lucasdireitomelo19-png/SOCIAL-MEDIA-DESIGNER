"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { useHasMounted } from "@/lib/use-has-mounted";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const mounted = useHasMounted();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    if (mounted && items.length === 0 && !orderPlaced) {
      router.replace("/carrinho");
    }
  }, [mounted, items.length, orderPlaced, router]);

  if (!mounted || (items.length === 0 && !orderPlaced)) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      customerName: form.get("customerName"),
      customerPhone: form.get("customerPhone"),
      customerEmail: form.get("customerEmail"),
      address: form.get("address"),
      city: form.get("city"),
      state: form.get("state"),
      zip: form.get("zip"),
      notes: form.get("notes"),
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Não foi possível finalizar o pedido");
      }
      setOrderPlaced(true);
      clear();
      router.push(`/pedido/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-stone-900">Finalizar pedido</h1>
      <p className="mt-1 text-sm text-stone-500">
        Total: <span className="font-semibold text-stone-900">{formatMoney(cartTotal(items))}</span>
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome completo" name="customerName" required className="sm:col-span-2" />
        <Field label="WhatsApp / Telefone" name="customerPhone" required />
        <Field label="E-mail (opcional)" name="customerEmail" type="email" />
        <Field label="Endereço" name="address" required className="sm:col-span-2" />
        <Field label="Cidade" name="city" required />
        <Field label="Estado" name="state" required />
        <Field label="CEP" name="zip" required />
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-stone-700">
            Observações (opcional)
          </label>
          <textarea
            name="notes"
            rows={3}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60 sm:col-span-2"
        >
          {submitting ? "Enviando..." : "Confirmar pedido"}
        </button>
        <p className="text-xs text-stone-400 sm:col-span-2">
          O pagamento e a entrega são combinados diretamente com a loja após a confirmação do
          pedido.
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
      />
    </div>
  );
}
