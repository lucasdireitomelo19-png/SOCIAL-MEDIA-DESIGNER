import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/product-schema";
import { slugify } from "@/lib/format";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("categoria") ?? undefined;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      stock: { gt: 0 },
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const baseSlug = slugify(data.name);
  let slug = baseSlug;
  let attempt = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: Math.round(data.price * 100),
      category: data.category,
      size: data.size || null,
      condition: data.condition,
      images: JSON.stringify(data.images),
      stock: data.stock,
      active: data.active,
      slug,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
