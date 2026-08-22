"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

export default function OrderPendingPage() {
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-5xl">⏳</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-brand-dark">Pedido recebido</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Seu pedido foi registrado e está aguardando a confirmação do pagamento. Você receberá um
        e-mail assim que ele for aprovado.
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
