"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/actions/product-actions";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Tem certeza que deseja excluir esta peça?")) return;
          setError(null);
          startTransition(async () => {
            try {
              await deleteProduct(productId);
              router.push("/admin/produtos");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erro ao excluir a peça.");
            }
          });
        }}
        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
      >
        {isPending ? "Excluindo..." : "Excluir peça"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
