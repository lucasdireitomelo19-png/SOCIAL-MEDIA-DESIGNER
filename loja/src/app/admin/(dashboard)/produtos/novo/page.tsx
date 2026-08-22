import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/app/admin/(dashboard)/produtos/actions";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Novo produto</h1>
        <p className="text-sm text-stone-500">Cadastre uma nova peça do brechó.</p>
      </div>
      <div className="max-w-2xl rounded-lg border border-stone-200 bg-white p-6">
        <ProductForm action={createProduct} submitLabel="Cadastrar produto" />
      </div>
    </div>
  );
}
