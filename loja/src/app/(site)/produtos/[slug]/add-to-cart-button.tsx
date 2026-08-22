"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCartStore } from "@/store/cart";

export default function AddToCartButton({
  product,
}: {
  product: { id: string; name: string; slug: string; price: number; size: string; image: string | null };
}) {
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const alreadyInCart = items.some((i) => i.productId === product.id);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        disabled={alreadyInCart}
        onClick={() => {
          addItem({
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            size: product.size,
            image: product.image,
          });
          setAdded(true);
        }}
        className="rounded-full bg-brand-dark px-6 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {alreadyInCart ? "Já está na sacola" : "Adicionar à sacola"}
      </button>
      {added && (
        <button
          type="button"
          onClick={() => router.push("/carrinho")}
          className="rounded-full border border-brand-dark px-6 py-3 text-sm font-medium text-brand-dark transition hover:bg-brand-dark hover:text-white"
        >
          Ir para a sacola
        </button>
      )}
    </div>
  );
}
