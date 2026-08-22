"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

export default function OrderSuccessPage() {
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-5xl">🎉</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-brand-dark">Pagamento aprovado!</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Seu pedido foi confirmado. Em breve enviaremos os detalhes de envio para o seu e-mail.
      </p>
      <Link
        href="/produtos"
        className="mt-8 inline-block rounded-full bg-brand-dark px-6 py-3 text-sm font-medium text-white hover:bg-black"
      >
        Continuar comprando
      </Link>
    </div>
  );
}
