import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import { formatCurrency } from "@/lib/format";
import CartIndicator from "./cart-indicator";

export default async function SiteHeader() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <header className="sticky top-0 z-40 border-b border-brand-line bg-brand-bg/95 backdrop-blur">
      <div className="bg-brand-dark px-4 py-2 text-center text-xs text-white">
        Frete grátis em compras acima de {formatCurrency(siteConfig.freeShippingThreshold)}
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-brand-dark">
          {siteConfig.name}
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/produtos?categoria=${category.slug}`}
              className="text-sm font-medium text-neutral-600 hover:text-brand-accent"
            >
              {category.name}
            </Link>
          ))}
          <Link href="/produtos" className="text-sm font-medium text-neutral-600 hover:text-brand-accent">
            Todas as peças
          </Link>
        </nav>
        <div className="flex items-center gap-5">
          <CartIndicator />
        </div>
      </div>
    </header>
  );
}
