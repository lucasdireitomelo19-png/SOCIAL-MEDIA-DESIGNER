import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { conditionLabels } from "@/lib/site-config";
import { releaseStaleReservations } from "@/lib/inventory";
import AddToCartButton from "./add-to-cart-button";
import ProductCard from "@/components/site/product-card";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await releaseStaleReservations();

  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, status: "DISPONIVEL" },
    take: 4,
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  const isAvailable = product.status === "DISPONIVEL";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-6 text-xs text-neutral-400">
        <Link href="/produtos" className="hover:text-brand-accent">
          Todas as peças
        </Link>{" "}
        / <span className="text-neutral-500">{product.category.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          {product.images.length === 0 && (
            <div className="col-span-2 aspect-[4/5] rounded-xl bg-neutral-100" />
          )}
          {product.images.map((image, index) => (
            <div
              key={image.id}
              className={`relative overflow-hidden rounded-xl bg-neutral-100 ${
                index === 0 ? "col-span-2 aspect-[4/5]" : "aspect-square"
              }`}
            >
              <Image src={image.url} alt={product.name} fill className="object-cover" />
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
            {product.brand ?? product.category.name}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-brand-dark">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold text-brand-dark">{formatCurrency(product.price)}</p>

          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-28 text-neutral-500">Tamanho</dt>
              <dd className="text-brand-dark">{product.size}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 text-neutral-500">Condição</dt>
              <dd className="text-brand-dark">{conditionLabels[product.condition]}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 text-neutral-500">Categoria</dt>
              <dd className="text-brand-dark">{product.category.name}</dd>
            </div>
          </dl>

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
            {product.description}
          </p>

          <p className="mt-2 text-xs text-neutral-400">
            Peça única de brechó — ao vender, ela sai do catálogo.
          </p>

          <div className="mt-6">
            {isAvailable ? (
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  size: product.size,
                  image: product.images[0]?.url ?? null,
                }}
              />
            ) : (
              <p className="rounded-full bg-neutral-100 px-6 py-3 text-center text-sm font-medium text-neutral-500">
                {product.status === "VENDIDO" ? "Peça vendida" : "Peça reservada"}
              </p>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-display text-2xl font-semibold text-brand-dark">Você também pode gostar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
