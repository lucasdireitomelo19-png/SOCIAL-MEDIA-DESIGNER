import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { formatMoney } from "@/lib/format";
import { AddToCartButton } from "@/components/site/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const image = product.images[0] ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-stone-100">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-400">
              Sem imagem
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-stone-400">
            {product.category}
            {product.size ? ` · Tam. ${product.size}` : ""}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-900">{product.name}</h1>
          <p className="mt-2 inline-block rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
            {product.condition}
          </p>
          <p className="mt-4 text-2xl font-semibold text-stone-900">
            {formatMoney(product.price)}
          </p>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-stone-600">
            {product.description}
          </p>
          <p className="mt-2 text-xs text-stone-400">
            {product.stock > 0
              ? `${product.stock} disponível${product.stock > 1 ? "eis" : ""}`
              : "Esgotado"}
          </p>

          <div className="mt-6">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              price={product.price}
              image={image}
              slug={product.slug}
              stock={product.stock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
