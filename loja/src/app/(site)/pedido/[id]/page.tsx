import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
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
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
        <p className="text-sm font-medium text-emerald-600">Pedido confirmado!</p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">
          Obrigado, {order.customerName.split(" ")[0]}
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Pedido #{order.id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}
        </p>
        <p className="mt-4 text-sm text-stone-600">
          A loja vai entrar em contato pelo telefone informado para combinar o pagamento e a
          entrega.
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-stone-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-stone-900">Itens do pedido</h2>
        <ul className="mt-3 divide-y divide-stone-200">
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

      <Link
        href="/produtos"
        className="mt-8 block text-center text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        ← Continuar comprando
      </Link>
    </div>
  );
}
