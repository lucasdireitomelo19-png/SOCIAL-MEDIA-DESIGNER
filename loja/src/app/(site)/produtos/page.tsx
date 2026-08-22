import Link from "next/link";
import { getActiveProducts, getCategories } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; busca?: string }>;
}) {
  const { categoria, busca } = await searchParams;
  const [products, categories] = await Promise.all([
    getActiveProducts({ category: categoria, query: busca }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-stone-900">Produtos</h1>

      <form className="mt-4 flex flex-wrap gap-2" action="/produtos">
        <input
          type="text"
          name="busca"
          defaultValue={busca}
          placeholder="Buscar peças..."
          className="w-full max-w-xs rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <button
          type="submit"
          className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Buscar
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={busca ? `/produtos?busca=${encodeURIComponent(busca)}` : "/produtos"}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            !categoria
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-stone-300 text-stone-600 hover:bg-stone-100"
          }`}
        >
          Todas
        </Link>
        {categories.map((cat) => {
          const params = new URLSearchParams();
          params.set("categoria", cat);
          if (busca) params.set("busca", busca);
          return (
            <Link
              key={cat}
              href={`/produtos?${params.toString()}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                categoria === cat
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 text-stone-600 hover:bg-stone-100"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      {products.length === 0 ? (
        <p className="mt-10 text-sm text-stone-500">
          Nenhum produto encontrado com esses filtros.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
