"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function CatalogFilters({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/produtos?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={searchParams.get("categoria") ?? ""}
        onChange={(e) => updateParam("categoria", e.target.value)}
        className="rounded-full border border-brand-line bg-white px-4 py-2 text-sm text-brand-dark focus:border-brand-accent focus:outline-none"
      >
        <option value="">Todas as categorias</option>
        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("ordenar") ?? ""}
        onChange={(e) => updateParam("ordenar", e.target.value)}
        className="rounded-full border border-brand-line bg-white px-4 py-2 text-sm text-brand-dark focus:border-brand-accent focus:outline-none"
      >
        <option value="">Mais recentes</option>
        <option value="menor-preco">Menor preço</option>
        <option value="maior-preco">Maior preço</option>
      </select>

      <input
        type="search"
        placeholder="Buscar por nome ou marca"
        defaultValue={searchParams.get("busca") ?? ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            updateParam("busca", (e.target as HTMLInputElement).value);
          }
        }}
        className="rounded-full border border-brand-line bg-white px-4 py-2 text-sm text-brand-dark focus:border-brand-accent focus:outline-none"
      />
    </div>
  );
}
