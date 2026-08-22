import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/order-schema";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: data.items.map((i) => i.productId) } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));
      let total = 0;
      const itemsData = data.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product || !product.active) {
          throw new Error(`Produto indisponível: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Estoque insuficiente para "${product.name}"`);
        }
        total += product.price * item.quantity;
        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        };
      });

      const created = await tx.order.create({
        data: {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || null,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          notes: data.notes || null,
          total,
          items: { create: itemsData },
        },
        include: { items: true },
      });

      for (const item of itemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar pedido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return NextResponse.json(orders);
}
