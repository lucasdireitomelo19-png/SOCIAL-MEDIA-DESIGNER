import Link from "next/link";
import { getActiveProducts } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getActiveProducts();
  const featured = products.slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="rounded-2xl bg-stone-900 px-6 py-14 text-center text-stone-50 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Moda circular, com curadoria e estilo
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-300">
          Peças únicas, seminovas e vintage. Compre bonito, compre consciente.
        </p>
        <Link
          href="/produtos"
          className="mt-6 inline-block rounded-md bg-white px-5 py-2.5 text-sm font-medium text-stone-900 hover:bg-stone-200"
        >
          Ver todos os produtos
        </Link>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">Recém-chegados</h2>
          <Link href="/produtos" className="text-sm font-medium text-stone-600 hover:text-stone-900">
            Ver tudo →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="mt-6 text-sm text-stone-500">
            Nenhum produto disponível no momento. Volte em breve!
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
