"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";

export function AddToCartButton({
  productId,
  name,
  price,
  image,
  slug,
  stock,
}: {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  slug: string;
  stock: number;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  if (stock <= 0) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-md bg-stone-200 px-5 py-3 text-sm font-medium text-stone-500"
      >
        Esgotado
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => {
          addItem({ productId, name, price, image, slug, stock });
          setAdded(true);
        }}
        className="w-full rounded-md bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
      >
        Adicionar ao carrinho
      </button>
      {added && (
        <button
          onClick={() => router.push("/carrinho")}
          className="w-full rounded-md border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Item adicionado · ir para o carrinho
        </button>
      )}
    </div>
  );
}
