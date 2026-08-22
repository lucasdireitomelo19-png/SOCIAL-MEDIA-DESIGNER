"use server";

import * as z from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPreferenceClient, isMercadoPagoConfigured } from "@/lib/mercadopago";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, { error: "Informe seu nome completo." }),
  customerEmail: z.email({ error: "Informe um e-mail válido." }),
  customerPhone: z.string().trim().min(8, { error: "Informe um telefone válido." }),
  shippingStreet: z.string().trim().min(2, { error: "Informe a rua." }),
  shippingNumber: z.string().trim().min(1, { error: "Informe o número." }),
  shippingComplement: z.string().trim().optional(),
  shippingDistrict: z.string().trim().min(1, { error: "Informe o bairro." }),
  shippingCity: z.string().trim().min(1, { error: "Informe a cidade." }),
  shippingState: z.string().trim().length(2, { error: "Use a sigla do estado (ex: SP)." }),
  shippingZip: z.string().trim().min(8, { error: "Informe um CEP válido." }),
});

export type CheckoutState = { error?: string } | undefined;

export async function createOrder(
  _prevState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone"),
    shippingStreet: formData.get("shippingStreet"),
    shippingNumber: formData.get("shippingNumber"),
    shippingComplement: formData.get("shippingComplement") || undefined,
    shippingDistrict: formData.get("shippingDistrict"),
    shippingCity: formData.get("shippingCity"),
    shippingState: formData.get("shippingState"),
    shippingZip: formData.get("shippingZip"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Verifique os dados informados." };
  }

  let cartProductIds: string[];
  try {
    const raw = JSON.parse(String(formData.get("items") ?? "[]")) as { productId: string }[];
    cartProductIds = raw.map((item) => item.productId);
  } catch {
    return { error: "Não foi possível ler os itens da sacola." };
  }

  if (cartProductIds.length === 0) {
    return { error: "Sua sacola está vazia." };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: cartProductIds } },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  const unavailable = products.filter((p) => p.status !== "DISPONIVEL");
  if (unavailable.length > 0 || products.length !== cartProductIds.length) {
    return {
      error: "Uma ou mais peças da sua sacola não estão mais disponíveis. Volte à sacola e remova-as.",
    };
  }

  const total = products.reduce((sum, product) => sum + product.price, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        ...parsed.data,
        total,
        items: {
          create: products.map((product) => ({
            productId: product.id,
            price: product.price,
            quantity: 1,
          })),
        },
      },
    });

    await tx.product.updateMany({
      where: { id: { in: products.map((p) => p.id) } },
      data: { status: "RESERVADO" },
    });

    return created;
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!isMercadoPagoConfigured()) {
    redirect(`/pedido/pendente?order=${order.id}&mp=off`);
  }

  let initPoint: string | null = null;
  try {
    const preference = await getPreferenceClient().create({
      body: {
        items: products.map((product) => ({
          id: product.id,
          title: product.name,
          quantity: 1,
          currency_id: "BRL",
          unit_price: product.price / 100,
          picture_url: product.images[0]
            ? `${siteUrl}${product.images[0].url}`
            : undefined,
        })),
        payer: {
          name: parsed.data.customerName,
          email: parsed.data.customerEmail,
        },
        external_reference: order.id,
        notification_url: `${siteUrl}/api/mercadopago/webhook`,
        back_urls: {
          success: `${siteUrl}/pedido/sucesso?order=${order.id}`,
          failure: `${siteUrl}/pedido/falha?order=${order.id}`,
          pending: `${siteUrl}/pedido/pendente?order=${order.id}`,
        },
        auto_return: "approved",
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: preference.id },
    });

    initPoint = preference.init_point ?? null;
  } catch (err) {
    console.error("Erro ao criar preferência do Mercado Pago:", err);
  }

  redirect(initPoint ?? `/pedido/pendente?order=${order.id}&mp=erro`);
}
