import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/actions/product-actions";
import ProductForm from "@/components/admin/product-form";
import DeleteProductButton from "@/components/admin/delete-product-button";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, product.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-dark">Editar peça</h1>
          <p className="text-sm text-neutral-500">{product.name}</p>
        </div>
        <DeleteProductButton productId={product.id} />
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <ProductForm
          action={boundUpdate}
          categories={categories}
          submitLabel="Salvar alterações"
          showStatus
          existingImages={product.images}
          defaultValues={{
            name: product.name,
            description: product.description,
            price: product.price,
            size: product.size,
            brand: product.brand,
            condition: product.condition,
            categoryId: product.categoryId,
            status: product.status,
            featured: product.featured,
          }}
        />
      </div>
    </div>
  );
}
