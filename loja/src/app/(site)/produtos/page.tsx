import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { releaseStaleReservations } from "@/lib/inventory";
import ProductCard from "@/components/site/product-card";
import CatalogFilters from "./catalog-filters";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; busca?: string; ordenar?: string }>;
}) {
  await releaseStaleReservations();

  const { categoria, busca, ordenar } = await searchParams;

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const where: Prisma.ProductWhereInput = {};
  if (categoria) {
    where.category = { slug: categoria };
  }
  if (busca) {
    where.OR = [
      { name: { contains: busca } },
      { brand: { contains: busca } },
      { description: { contains: busca } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    ordenar === "menor-preco"
      ? { price: "asc" }
      : ordenar === "maior-preco"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  const activeCategory = categories.find((c) => c.slug === categoria);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-brand-dark">
          {activeCategory ? activeCategory.name : "Todas as peças"}
        </h1>
        <p className="text-sm text-neutral-500">{products.length} peça(s) encontrada(s)</p>
      </div>

      <CatalogFilters categories={categories} />

      {products.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">
          Nenhuma peça encontrada com esses filtros.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
