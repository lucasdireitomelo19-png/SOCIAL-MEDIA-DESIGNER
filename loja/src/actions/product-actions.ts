"use server";

import * as z from "zod";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";
import { saveUpload, deleteUpload } from "@/lib/storage";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const productSchema = z.object({
  name: z.string().trim().min(2, { error: "Informe o nome da peça." }),
  description: z.string().trim().min(5, { error: "Descreva a peça com mais detalhes." }),
  price: z.coerce.number().min(1, { error: "Informe um preço válido." }),
  size: z.string().trim().min(1, { error: "Informe o tamanho." }),
  brand: z.string().trim().optional(),
  condition: z.enum(["NOVO_COM_ETIQUETA", "SEMINOVO", "USADO"]),
  categoryId: z.string().min(1, { error: "Selecione uma categoria." }),
  status: z.enum(["DISPONIVEL", "RESERVADO", "VENDIDO"]).optional(),
  featured: z.union([z.literal("on"), z.literal(null)]).optional(),
});

export type ProductFormState = { error?: string } | undefined;

async function saveUploadedImages(files: File[]) {
  const validFiles = files.filter((file) => file instanceof File && file.size > 0);
  if (validFiles.length === 0) return [];

  const saved: string[] = [];
  for (const file of validFiles) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error("Apenas imagens JPG, PNG ou WEBP são permitidas.");
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error("Cada imagem deve ter no máximo 5MB.");
    }
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveUpload(filename, buffer, file.type);
    saved.push(url);
  }
  return saved;
}

function parsePrice(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Math.round(Number(normalized) * 100);
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await verifyAdminSession();

  const priceInput = String(formData.get("price") ?? "");
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: parsePrice(priceInput),
    size: formData.get("size"),
    brand: formData.get("brand") || undefined,
    condition: formData.get("condition"),
    categoryId: formData.get("categoryId"),
    featured: formData.get("featured"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Verifique os campos do formulário." };
  }

  const files = formData.getAll("images") as File[];
  let imageUrls: string[];
  try {
    imageUrls = await saveUploadedImages(files);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao enviar imagens." };
  }

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let attempt = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${attempt++}`;
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      size: parsed.data.size,
      brand: parsed.data.brand || null,
      condition: parsed.data.condition,
      categoryId: parsed.data.categoryId,
      featured: parsed.data.featured === "on",
      images: { create: imageUrls.map((url, position) => ({ url, position })) },
    },
  });

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  redirect(`/admin/produtos/${product.id}/editar`);
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await verifyAdminSession();

  const priceInput = String(formData.get("price") ?? "");
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: parsePrice(priceInput),
    size: formData.get("size"),
    brand: formData.get("brand") || undefined,
    condition: formData.get("condition"),
    categoryId: formData.get("categoryId"),
    status: formData.get("status"),
    featured: formData.get("featured"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Verifique os campos do formulário." };
  }

  const files = formData.getAll("images") as File[];
  let imageUrls: string[];
  try {
    imageUrls = await saveUploadedImages(files);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao enviar imagens." };
  }

  const removeIds = formData.getAll("removeImage") as string[];

  await prisma.$transaction(async (tx) => {
    if (removeIds.length > 0) {
      await tx.productImage.deleteMany({ where: { id: { in: removeIds }, productId } });
    }
    if (imageUrls.length > 0) {
      const currentMax = await tx.productImage.count({ where: { productId } });
      await tx.productImage.createMany({
        data: imageUrls.map((url, i) => ({ url, position: currentMax + i, productId })),
      });
    }
    await tx.product.update({
      where: { id: productId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        size: parsed.data.size,
        brand: parsed.data.brand || null,
        condition: parsed.data.condition,
        categoryId: parsed.data.categoryId,
        status: parsed.data.status ?? "DISPONIVEL",
        featured: parsed.data.featured === "on",
      },
    });
  });

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${productId}/editar`);
  revalidatePath("/produtos");

  return { error: undefined };
}

export async function deleteProduct(productId: string) {
  await verifyAdminSession();

  const ordersCount = await prisma.orderItem.count({ where: { productId } });
  if (ordersCount > 0) {
    throw new Error(
      "Esta peça já foi vendida em algum pedido e não pode ser excluída. Marque como 'Vendido' em vez disso.",
    );
  }

  const images = await prisma.productImage.findMany({ where: { productId } });
  await prisma.product.delete({ where: { id: productId } });

  for (const image of images) {
    // Fotos de exemplo do seed (/placeholders/...) são arquivos estáticos do repositório,
    // não uploads — não têm o que apagar do storage.
    if (image.url.startsWith("/placeholders/")) continue;
    await deleteUpload(image.url).catch(() => {});
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
}
