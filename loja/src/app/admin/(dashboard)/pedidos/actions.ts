"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-schema";

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    throw new Error("Status inválido");
  }
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin");
}
