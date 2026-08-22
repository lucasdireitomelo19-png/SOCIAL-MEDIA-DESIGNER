import { prisma } from "@/lib/prisma";

const REVENUE_STATUSES = ["pago", "enviado", "entregue"];

export async function getDashboardInsights() {
  const [orders, statusCounts, products, lowStock] = await Promise.all([
    prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.findMany({
      where: { active: true, stock: { lte: 2 } },
      orderBy: { stock: "asc" },
      take: 5,
    }),
  ]);

  const revenueOrders = orders.filter((o) => REVENUE_STATUSES.includes(o.status));
  const totalRevenue = revenueOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const averageTicket = revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0;

  const statusMap = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count._all]),
  ) as Record<string, number>;

  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const current = productSales.get(item.productId) ?? {
        name: item.name,
        quantity: 0,
        revenue: 0,
      };
      current.quantity += item.quantity;
      current.revenue += item.price * item.quantity;
      productSales.set(item.productId, current);
    }
  }
  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const days: { date: string; revenue: number; orders: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    days.push({ date: key, revenue: 0, orders: 0 });
  }
  const dayIndex = new Map(days.map((d, idx) => [d.date, idx]));
  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const idx = dayIndex.get(key);
    if (idx !== undefined) {
      days[idx].orders += 1;
      if (REVENUE_STATUSES.includes(order.status)) {
        days[idx].revenue += order.total;
      }
    }
  }

  return {
    totalRevenue,
    totalOrders,
    averageTicket,
    activeProducts: products,
    statusCounts: statusMap,
    lowStock,
    topProducts,
    dailyRevenue: days,
    recentOrders: orders.slice(0, 8),
  };
}
