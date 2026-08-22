import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import OrderStatusForm from "./order-status-form";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-brand-dark">
          Pedido de {order.customerName}
        </h1>
        <p className="text-sm text-neutral-500">
          Feito em {order.createdAt.toLocaleString("pt-BR")}
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-brand-dark">Status</h2>
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-brand-dark">Cliente</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Nome</dt>
              <dd className="text-right text-brand-dark">{order.customerName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">E-mail</dt>
              <dd className="text-right text-brand-dark">{order.customerEmail}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Telefone</dt>
              <dd className="text-right text-brand-dark">{order.customerPhone}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-brand-dark">Entrega</h2>
          <p className="mt-3 text-sm text-brand-dark">
            {order.shippingStreet}, {order.shippingNumber}
            {order.shippingComplement ? ` - ${order.shippingComplement}` : ""}
            <br />
            {order.shippingDistrict} - {order.shippingCity}/{order.shippingState}
            <br />
            CEP {order.shippingZip}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-brand-dark">Itens</h2>
        <ul className="mt-3 divide-y divide-neutral-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-brand-dark">
                {item.product.name} × {item.quantity}
              </span>
              <span className="font-medium text-brand-dark">{formatCurrency(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3 text-sm font-semibold">
          <span className="text-brand-dark">Total</span>
          <span className="text-brand-dark">{formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
