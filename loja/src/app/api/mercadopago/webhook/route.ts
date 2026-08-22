import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentClient, isMercadoPagoConfigured } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ received: true });
  }

  const url = new URL(request.url);
  let paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const type = url.searchParams.get("type") ?? url.searchParams.get("topic");

  if (!paymentId) {
    try {
      const body = await request.json();
      paymentId = body?.data?.id ?? null;
    } catch {
      // corpo vazio ou inválido, segue sem paymentId
    }
  }

  if (!paymentId || (type && type !== "payment")) {
    return NextResponse.json({ received: true });
  }

  try {
    const payment = await getPaymentClient().get({ id: paymentId });
    const orderId = payment.external_reference;
    if (!orderId) return NextResponse.json({ received: true });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ received: true });

    if (payment.status === "approved") {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: { status: "PAGO", mpPaymentId: String(payment.id) },
        });
        const items = await tx.orderItem.findMany({ where: { orderId } });
        await tx.product.updateMany({
          where: { id: { in: items.map((i) => i.productId) } },
          data: { status: "VENDIDO" },
        });
      });
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: { status: "CANCELADO", mpPaymentId: String(payment.id) },
        });
        const items = await tx.orderItem.findMany({ where: { orderId } });
        await tx.product.updateMany({
          where: { id: { in: items.map((i) => i.productId) }, status: "RESERVADO" },
          data: { status: "DISPONIVEL" },
        });
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: { mpPaymentId: String(payment.id) },
      });
    }
  } catch (err) {
    console.error("Erro ao processar webhook do Mercado Pago:", err);
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
