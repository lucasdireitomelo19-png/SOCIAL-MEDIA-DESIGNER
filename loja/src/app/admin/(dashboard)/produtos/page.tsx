import Link from "next/link";
import { getAllProductsAdmin } from "@/lib/products";
import { formatMoney } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Produtos</h1>
          <p className="text-sm text-stone-500">{products.length} produtos cadastrados.</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          + Novo produto
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-400">
            <tr>
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Estoque</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/produtos/${product.id}`}
                    className="font-medium text-stone-900 hover:underline"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-stone-600">{product.category}</td>
                <td className="px-4 py-3 text-stone-600">{formatMoney(product.price)}</td>
                <td className="px-4 py-3 text-stone-600">{product.stock}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      product.active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {product.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-stone-400">
                  Nenhum produto cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
