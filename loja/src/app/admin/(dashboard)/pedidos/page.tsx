import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Pedidos</h1>
        <p className="text-sm text-stone-500">{orders.length} pedidos recebidos.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-400">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Itens</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="font-medium text-stone-900 hover:underline"
                  >
                    {order.customerName}
                  </Link>
                  <p className="text-xs text-stone-400">{order.customerPhone}</p>
                </td>
                <td className="px-4 py-3 text-stone-600">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3 text-stone-600">{order.items.length}</td>
                <td className="px-4 py-3 font-medium text-stone-900">
                  {formatMoney(order.total)}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-stone-400">
                  Nenhum pedido recebido ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
