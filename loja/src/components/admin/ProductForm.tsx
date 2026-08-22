"use client";

import { useActionState } from "react";
import type { ProductView } from "@/lib/products";

type ActionState = { error?: string; success?: boolean } | undefined;
type ProductAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: ProductAction;
  product?: ProductView;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:col-span-2">
          Produto atualizado com sucesso.
        </p>
      )}

      <Field label="Nome" name="name" defaultValue={product?.name} required className="sm:col-span-2" />

      <div className="sm:col-span-2">
        <label htmlFor="description" className="text-sm font-medium text-stone-700">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          defaultValue={product?.description}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />
      </div>

      <Field
        label="Preço (R$)"
        name="price"
        type="number"
        step="0.01"
        min="0"
        defaultValue={product ? (product.price / 100).toFixed(2) : undefined}
        required
      />
      <Field label="Estoque" name="stock" type="number" min="0" defaultValue={product?.stock ?? 1} required />
      <Field label="Categoria" name="category" defaultValue={product?.category} required />
      <Field label="Tamanho (opcional)" name="size" defaultValue={product?.size ?? ""} />
      <Field
        label="Estado de conservação"
        name="condition"
        defaultValue={product?.condition}
        placeholder="Ex: Seminovo, Usado, Novo com etiqueta"
        required
        className="sm:col-span-2"
      />

      <div className="sm:col-span-2">
        <label htmlFor="images" className="text-sm font-medium text-stone-700">
          URLs das imagens (uma por linha)
        </label>
        <textarea
          id="images"
          name="images"
          rows={3}
          required
          defaultValue={product?.images.join("\n")}
          placeholder="https://..."
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm font-mono focus:border-stone-500 focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-700 sm:col-span-2">
        <input
          type="checkbox"
          name="active"
          defaultChecked={product?.active ?? true}
          className="h-4 w-4 rounded border-stone-300"
        />
        Produto visível na loja
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60 sm:col-span-2 sm:w-auto"
      >
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  className,
  placeholder,
  step,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  className?: string;
  placeholder?: string;
  step?: string;
  min?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        step={step}
        min={min}
        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
      />
    </div>
  );
}
