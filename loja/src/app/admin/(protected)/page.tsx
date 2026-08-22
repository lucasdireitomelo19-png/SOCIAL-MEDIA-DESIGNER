import Link from "next/link";
import { getDashboardInsights } from "@/lib/admin/insights";
import { formatCurrency } from "@/lib/format";
import { orderStatusLabels } from "@/lib/site-config";
import StatCard from "@/components/admin/stat-card";
import RevenueChart from "@/components/admin/revenue-chart";

export default async function AdminDashboardPage() {
  const insights = await getDashboardInsights();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-brand-dark">Visão geral</h1>
        <p className="text-sm text-neutral-500">Acompanhe as vendas e o desempenho do brechó.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Receita (pedidos pagos)" value={formatCurrency(insights.totalRevenueCents)} />
        <StatCard label="Pedidos totais" value={String(insights.totalOrders)} />
        <StatCard label="Aguardando pagamento" value={String(insights.pendingOrders)} />
        <StatCard label="Peças disponíveis" value={String(insights.availableProducts)} />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-brand-dark">
          Receita nos últimos 14 dias
        </h2>
        <div className="mt-4">
          <RevenueChart data={insights.revenueByDay} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-brand-dark">Mais vendidos</h2>
          {insights.topProducts.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-400">Ainda não há vendas registradas.</p>
          ) : (
            <ul className="mt-3 divide-y divide-neutral-100">
              {insights.topProducts.map((item) => (
                <li key={item.product?.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-brand-dark">{item.product?.name}</span>
                  <span className="text-neutral-500">{item.quantity} un.</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-brand-dark">Pedidos recentes</h2>
            <Link href="/admin/pedidos" className="text-xs font-medium text-brand-accent hover:underline">
              Ver todos
            </Link>
          </div>
          {insights.recentOrders.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-400">Nenhum pedido ainda.</p>
          ) : (
            <ul className="mt-3 divide-y divide-neutral-100">
              {insights.recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="text-brand-dark">{order.customerName}</p>
                    <p className="text-xs text-neutral-400">
                      {order.items.length} {order.items.length === 1 ? "item" : "itens"} ·{" "}
                      {orderStatusLabels[order.status]}
                    </p>
                  </div>
                  <span className="font-medium text-brand-dark">{formatCurrency(order.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
