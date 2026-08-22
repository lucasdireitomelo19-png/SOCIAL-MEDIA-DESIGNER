import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { conditionLabels } from "@/lib/site-config";

const statusStyles: Record<string, string> = {
  DISPONIVEL: "bg-emerald-100 text-emerald-700",
  RESERVADO: "bg-amber-100 text-amber-700",
  VENDIDO: "bg-neutral-200 text-neutral-700",
};

const statusLabels: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-dark">Produtos</h1>
          <p className="text-sm text-neutral-500">{products.length} peça(s) cadastrada(s).</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="rounded-full bg-brand-dark px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
        >
          + Nova peça
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Peça</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Condição</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/produtos/${product.id}/editar`} className="flex items-center gap-3">
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="font-medium text-brand-dark hover:underline">{product.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600">{product.category.name}</td>
                <td className="px-4 py-3 font-medium text-brand-dark">{formatCurrency(product.price)}</td>
                <td className="px-4 py-3 text-neutral-600">{conditionLabels[product.condition]}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[product.status]}`}>
                    {statusLabels[product.status]}
                  </span>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  Nenhuma peça cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
