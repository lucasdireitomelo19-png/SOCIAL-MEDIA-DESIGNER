import "server-only";
import { prisma } from "@/lib/prisma";

const PAID_STATUSES = ["PAGO", "ENVIADO", "ENTREGUE"] as const;

export async function getDashboardInsights() {
  const [paidOrders, orderCounts, productCounts, recentOrders, lowStockCandidates] =
    await Promise.all([
      prisma.order.findMany({
        where: { status: { in: [...PAID_STATUSES] } },
        select: { id: true, total: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.product.count({ where: { status: "DISPONIVEL" } }),
    ]);

  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orderCounts.reduce((sum, group) => sum + group._count._all, 0);
  const pendingOrders =
    orderCounts.find((g) => g.status === "AGUARDANDO_PAGAMENTO")?._count._all ?? 0;

  const revenueByDay = new Map<string, number>();
  for (const order of paidOrders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + order.total);
  }

  const days: { date: string; total: number }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, total: (revenueByDay.get(key) ?? 0) / 100 });
  }

  const productIds = productCounts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const topProducts = productCounts
    .map((p) => ({
      product: productMap.get(p.productId),
      quantity: p._sum.quantity ?? 0,
      revenue: p._sum.price ?? 0,
    }))
    .filter((p) => p.product);

  return {
    totalRevenueCents: totalRevenue,
    totalOrders,
    pendingOrders,
    availableProducts: lowStockCandidates,
    revenueByDay: days,
    topProducts,
    recentOrders,
  };
}
