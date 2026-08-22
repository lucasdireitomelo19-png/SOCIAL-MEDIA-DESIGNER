import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { updateProduct, deleteProduct } from "@/app/admin/(dashboard)/produtos/actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, product.id);
  const deleteWithId = deleteProduct.bind(null, product.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Editar produto</h1>
          <p className="text-sm text-stone-500">{product.name}</p>
        </div>
        <DeleteProductButton action={deleteWithId} />
      </div>
      <div className="max-w-2xl rounded-lg border border-stone-200 bg-white p-6">
        <ProductForm action={updateWithId} product={product} submitLabel="Salvar alterações" />
      </div>
    </div>
  );
}
