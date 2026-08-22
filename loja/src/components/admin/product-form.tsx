"use client";

import { useActionState } from "react";
import Image from "next/image";
import type { ProductFormState } from "@/actions/product-actions";
import { conditionLabels } from "@/lib/site-config";

type Category = { id: string; name: string };
type ExistingImage = { id: string; url: string };

export default function ProductForm({
  action,
  categories,
  submitLabel,
  defaultValues,
  existingImages,
  showStatus,
}: {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: Category[];
  submitLabel: string;
  defaultValues?: {
    name: string;
    description: string;
    price: number;
    size: string;
    brand: string | null;
    condition: string;
    categoryId: string;
    status?: string;
    featured: boolean;
  };
  existingImages?: ExistingImage[];
  showStatus?: boolean;
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, undefined);

  const defaultPrice = defaultValues ? (defaultValues.price / 100).toFixed(2).replace(".", ",") : "";

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-brand-dark">Nome da peça</label>
          <input
            name="name"
            defaultValue={defaultValues?.name}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-brand-dark">Descrição</label>
          <textarea
            name="description"
            defaultValue={defaultValues?.description}
            required
            rows={4}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">Preço (R$)</label>
          <input
            name="price"
            defaultValue={defaultPrice}
            placeholder="99,90"
            required
            inputMode="decimal"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">Tamanho</label>
          <input
            name="size"
            defaultValue={defaultValues?.size}
            placeholder="P, M, G, 38, Único..."
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">Marca (opcional)</label>
          <input
            name="brand"
            defaultValue={defaultValues?.brand ?? ""}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">Condição</label>
          <select
            name="condition"
            defaultValue={defaultValues?.condition ?? "SEMINOVO"}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
          >
            {Object.entries(conditionLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">Categoria</label>
          <select
            name="categoryId"
            defaultValue={defaultValues?.categoryId}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
          >
            <option value="" disabled>
              Selecione...
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {showStatus && (
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">Status</label>
            <select
              name="status"
              defaultValue={defaultValues?.status ?? "DISPONIVEL"}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
            >
              <option value="DISPONIVEL">Disponível</option>
              <option value="RESERVADO">Reservado</option>
              <option value="VENDIDO">Vendido</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            defaultChecked={defaultValues?.featured}
            className="h-4 w-4 rounded border-neutral-300 text-brand-accent focus:ring-brand-accent"
          />
          <label htmlFor="featured" className="text-sm text-brand-dark">
            Destacar na home (&quot;Mais populares&quot;)
          </label>
        </div>
      </div>

      {existingImages && existingImages.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-brand-dark">Fotos atuais</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {existingImages.map((image) => (
              <label key={image.id} className="group relative block cursor-pointer overflow-hidden rounded-lg border border-neutral-200">
                <div className="relative aspect-[4/5]">
                  <Image src={image.url} alt="" fill className="object-cover" />
                </div>
                <div className="absolute inset-0 flex items-end justify-end bg-black/0 p-1.5 transition group-has-[:checked]:bg-black/40">
                  <input type="checkbox" name="removeImage" value={image.id} className="h-4 w-4" />
                </div>
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-neutral-400">Marque a caixinha para remover uma foto.</p>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark">
          {existingImages ? "Adicionar novas fotos" : "Fotos da peça"}
        </label>
        <input
          name="images"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="w-full rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm"
        />
        <p className="mt-1 text-xs text-neutral-400">JPG, PNG ou WEBP, até 5MB cada.</p>
      </div>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-dark px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
      >
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
