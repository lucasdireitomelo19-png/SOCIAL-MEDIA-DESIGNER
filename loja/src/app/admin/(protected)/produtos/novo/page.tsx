import { prisma } from "@/lib/prisma";
import { createProduct } from "@/actions/product-actions";
import ProductForm from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-brand-dark">Nova peça</h1>
        <p className="text-sm text-neutral-500">Cadastre uma nova peça no catálogo do brechó.</p>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <ProductForm action={createProduct} categories={categories} submitLabel="Cadastrar peça" />
      </div>
    </div>
  );
}
