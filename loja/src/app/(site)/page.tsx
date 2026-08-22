import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import { releaseStaleReservations } from "@/lib/inventory";
import ProductCard from "@/components/site/product-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await releaseStaleReservations();

  const [featured, recent, categories] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
            Moda circular
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-brand-dark sm:text-5xl">
            Peças com história, escolhidas com carinho.
          </h1>
          <p className="mt-4 text-neutral-600">
            No {siteConfig.shortName} cada peça é única. Garimpamos, avaliamos e cuidamos de cada
            item para que ele ganhe uma nova vida — e um novo dono.
          </p>
          <Link
            href="/produtos"
            className="mt-6 inline-block rounded-full bg-brand-dark px-6 py-3 text-sm font-medium text-white transition hover:bg-black"
          >
            Ver todas as peças
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/produtos?categoria=${category.slug}`}
              className="rounded-xl border border-brand-line bg-white px-4 py-4 text-center text-sm font-medium text-brand-dark transition hover:border-brand-accent hover:text-brand-accent"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-brand-dark">Mais populares</h2>
            <Link href="/produtos" className="text-sm font-medium text-brand-accent hover:underline">
              Ver tudo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-brand-dark">Recém chegados</h2>
          <Link href="/produtos" className="text-sm font-medium text-brand-accent hover:underline">
            Ver tudo
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {recent.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {recent.length === 0 && (
          <p className="text-sm text-neutral-400">Nenhuma peça cadastrada ainda.</p>
        )}
      </section>
    </div>
  );
}
