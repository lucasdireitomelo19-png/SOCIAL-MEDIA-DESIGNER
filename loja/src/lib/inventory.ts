import "server-only";
import { prisma } from "@/lib/prisma";

const RESERVATION_TIMEOUT_MINUTES = 30;

/**
 * Pedidos abandonados no checkout do Mercado Pago (usuário fecha a aba sem pagar)
 * nunca recebem webhook. Sem isso, a peça ficaria "reservada" para sempre.
 * Chamado nas páginas públicas antes de listar produtos.
 */
export async function releaseStaleReservations() {
  const cutoff = new Date(Date.now() - RESERVATION_TIMEOUT_MINUTES * 60 * 1000);

  const staleOrders = await prisma.order.findMany({
    where: { status: "AGUARDANDO_PAGAMENTO", createdAt: { lt: cutoff } },
    select: { id: true, items: { select: { productId: true } } },
  });

  if (staleOrders.length === 0) return;

  const productIds = staleOrders.flatMap((order) => order.items.map((item) => item.productId));

  await prisma.$transaction([
    prisma.order.updateMany({
      where: { id: { in: staleOrders.map((o) => o.id) } },
      data: { status: "CANCELADO" },
    }),
    prisma.product.updateMany({
      where: { id: { in: productIds }, status: "RESERVADO" },
      data: { status: "DISPONIVEL" },
    }),
  ]);
}
