import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/pedidos" className="text-sm text-stone-500 hover:text-stone-900">
        ← Voltar para pedidos
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">
            Pedido #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-stone-500">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-stone-900">Cliente</h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-stone-400">Nome</dt>
            <dd className="text-stone-800">{order.customerName}</dd>
            <dt className="text-stone-400">Telefone</dt>
            <dd className="text-stone-800">{order.customerPhone}</dd>
            {order.customerEmail && (
              <>
                <dt className="text-stone-400">E-mail</dt>
                <dd className="text-stone-800">{order.customerEmail}</dd>
              </>
            )}
          </dl>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-stone-900">Entrega</h2>
          <p className="mt-3 text-sm text-stone-800">
            {order.address}
            <br />
            {order.city} - {order.state}, {order.zip}
          </p>
          {order.notes && (
            <p className="mt-3 text-sm text-stone-500">
              <span className="font-medium text-stone-700">Obs:</span> {order.notes}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-stone-900">Itens</h2>
        <ul className="mt-3 divide-y divide-stone-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span className="text-stone-700">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium text-stone-900">
                {formatMoney(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-stone-200 pt-3 text-sm font-semibold text-stone-900">
          <span>Total</span>
          <span>{formatMoney(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
