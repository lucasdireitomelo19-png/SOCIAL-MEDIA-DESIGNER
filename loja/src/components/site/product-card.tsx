import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/format";
import { conditionLabels } from "@/lib/site-config";

export type ProductCardData = {
  slug: string;
  name: string;
  price: number;
  size: string;
  condition: string;
  status: string;
  images: { url: string }[];
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0]?.url;
  const sold = product.status === "VENDIDO";

  return (
    <Link href={`/produtos/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-100">
        {image && (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
            className={`object-cover transition duration-300 ${sold ? "grayscale" : "group-hover:scale-[1.03]"}`}
          />
        )}
        {sold && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-dark px-2.5 py-1 text-xs font-medium text-white">
            Vendido
          </span>
        )}
      </div>
      <div className="mt-2.5">
        <p className="text-sm font-medium text-brand-dark">{product.name}</p>
        <p className="text-xs text-neutral-500">
          Tam. {product.size} · {conditionLabels[product.condition]}
        </p>
        <p className="mt-1 text-sm font-semibold text-brand-dark">{formatCurrency(product.price)}</p>
      </div>
    </Link>
  );
}
