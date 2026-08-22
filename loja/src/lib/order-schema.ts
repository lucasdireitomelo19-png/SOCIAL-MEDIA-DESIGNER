import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
});

export const orderSchema = z.object({
  customerName: z.string().trim().min(2, "Informe seu nome completo"),
  customerPhone: z.string().trim().min(8, "Informe um telefone/WhatsApp válido"),
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  address: z.string().trim().min(3, "Informe o endereço"),
  city: z.string().trim().min(2, "Informe a cidade"),
  state: z.string().trim().min(2, "Informe o estado"),
  zip: z.string().trim().min(5, "Informe o CEP"),
  notes: z.string().trim().optional().or(z.literal("")),
  items: z.array(orderItemSchema).min(1, "O carrinho está vazio"),
});

export type OrderInput = z.infer<typeof orderSchema>;

export const ORDER_STATUSES = [
  "pendente",
  "pago",
  "enviado",
  "entregue",
  "cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
