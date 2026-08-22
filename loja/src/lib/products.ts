import { prisma } from "@/lib/prisma";
import type { Product } from "@/generated/prisma/client";

export type ProductView = Omit<Product, "images"> & { images: string[] };

export function toProductView(product: Product): ProductView {
  let images: string[] = [];
  try {
    const parsed = JSON.parse(product.images);
    if (Array.isArray(parsed)) images = parsed;
  } catch {
    images = [];
  }
  return { ...product, images };
}

export async function getActiveProducts(filters?: {
  category?: string;
  query?: string;
}): Promise<ProductView[]> {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      stock: { gt: 0 },
      ...(filters?.category ? { category: filters.category } : {}),
      ...(filters?.query
        ? {
            OR: [
              { name: { contains: filters.query } },
              { description: { contains: filters.query } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProductView);
}

export async function getCategories(): Promise<string[]> {
  const products = await prisma.product.findMany({
    where: { active: true, stock: { gt: 0 } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return products.map((p) => p.category);
}

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.active) return null;
  return toProductView(product);
}

export async function getProductById(id: string): Promise<ProductView | null> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return null;
  return toProductView(product);
}

export async function getAllProductsAdmin(): Promise<ProductView[]> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProductView);
}
