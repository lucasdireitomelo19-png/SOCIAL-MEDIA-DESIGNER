import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { ProductView } from "@/lib/products";

export function ProductCard({ product }: { product: ProductView }) {
  const image = product.images[0];

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-400">
            Sem imagem
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-stone-700 shadow-sm">
          {product.condition}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs uppercase tracking-wide text-stone-400">
          {product.category}
          {product.size ? ` · Tam. ${product.size}` : ""}
        </p>
        <h3 className="text-sm font-medium text-stone-900">{product.name}</h3>
        <p className="mt-auto text-base font-semibold text-stone-900">
          {formatMoney(product.price)}
        </p>
      </div>
    </Link>
  );
}
