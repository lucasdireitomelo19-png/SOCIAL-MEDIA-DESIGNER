import Link from "next/link";
import { getDashboardInsights } from "@/lib/insights";
import { formatMoney, formatDate } from "@/lib/format";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminDashboardPage() {
  const insights = await getDashboardInsights();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Visão geral</h1>
        <p className="text-sm text-stone-500">Insights de vendas e operação do brechó.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Receita total" value={formatMoney(insights.totalRevenue)} />
        <StatCard label="Pedidos" value={String(insights.totalOrders)} />
        <StatCard label="Ticket médio" value={formatMoney(insights.averageTicket)} />
        <StatCard label="Produtos ativos" value={String(insights.activeProducts)} />
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-stone-900">Receita nos últimos 14 dias</h2>
        <div className="mt-4">
          <RevenueChart data={insights.dailyRevenue} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-stone-900">Pedidos por status</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {Object.entries(insights.statusCounts).length === 0 && (
              <li className="text-sm text-stone-400">Nenhum pedido ainda.</li>
            )}
            {Object.entries(insights.statusCounts).map(([status, count]) => (
              <li key={status} className="flex items-center justify-between text-sm">
                <StatusBadge status={status} />
                <span className="font-medium text-stone-700">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-stone-900">Mais vendidos</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {insights.topProducts.length === 0 && (
              <li className="text-sm text-stone-400">Ainda sem vendas.</li>
            )}
            {insights.topProducts.map((p) => (
              <li key={p.name} className="flex items-center justify-between text-sm">
                <span className="text-stone-700">{p.name}</span>
                <span className="font-medium text-stone-900">{p.quantity} un.</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {insights.lowStock.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-900">Estoque baixo</h2>
          <ul className="mt-2 flex flex-col gap-1">
            {insights.lowStock.map((p) => (
              <li key={p.id} className="flex justify-between text-sm text-amber-800">
                <Link href={`/admin/produtos/${p.id}`} className="hover:underline">
                  {p.name}
                </Link>
                <span>{p.stock} un.</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900">Pedidos recentes</h2>
          <Link href="/admin/pedidos" className="text-xs font-medium text-stone-500 hover:text-stone-900">
            Ver todos →
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-stone-400">
                <th className="pb-2 font-medium">Cliente</th>
                <th className="pb-2 font-medium">Data</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {insights.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="py-2">
                    <Link href={`/admin/pedidos/${order.id}`} className="hover:underline">
                      {order.customerName}
                    </Link>
                  </td>
                  <td className="py-2 text-stone-500">{formatDate(order.createdAt)}</td>
                  <td className="py-2">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-2 text-right font-medium text-stone-900">
                    {formatMoney(order.total)}
                  </td>
                </tr>
              ))}
              {insights.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-stone-400">
                    Nenhum pedido ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
