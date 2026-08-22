"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { productSchema } from "@/lib/product-schema";
import { slugify } from "@/lib/format";

function parseForm(formData: FormData) {
  const imagesRaw = String(formData.get("images") ?? "");
  const images = imagesRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    size: formData.get("size"),
    condition: formData.get("condition"),
    images,
    stock: formData.get("stock"),
    active: formData.get("active") === "on",
  });
}

async function uniqueSlug(name: string, ignoreId?: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }
}

export async function createProduct(_prevState: unknown, formData: FormData) {
  await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;
  const slug = await uniqueSlug(data.name);

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: Math.round(data.price * 100),
      category: data.category,
      size: data.size || null,
      condition: data.condition,
      images: JSON.stringify(data.images),
      stock: data.stock,
      active: data.active,
    },
  });

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  redirect(`/admin/produtos/${product.id}`);
}

export async function updateProduct(id: string, _prevState: unknown, formData: FormData) {
  await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;
  const slug = await uniqueSlug(data.name, id);

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: Math.round(data.price * 100),
      category: data.category,
      size: data.size || null,
      condition: data.condition,
      images: JSON.stringify(data.images),
      stock: data.stock,
      active: data.active,
    },
  });

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  revalidatePath(`/produtos/${slug}`);
  return { success: true };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  redirect("/admin/produtos");
}
