import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do produto"),
  description: z.string().trim().min(5, "Descreva o produto"),
  // preço em reais (ex: 89.90), convertido para centavos antes de salvar
  price: z.coerce.number().positive("Informe um preço válido"),
  category: z.string().trim().min(2, "Informe a categoria"),
  size: z.string().trim().optional().or(z.literal("")),
  condition: z.string().trim().min(2, "Informe o estado de conservação"),
  images: z.array(z.string().url()).min(1, "Adicione ao menos uma imagem"),
  stock: z.coerce.number().int().min(0, "Estoque não pode ser negativo"),
  active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;
