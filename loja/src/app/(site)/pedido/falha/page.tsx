import Link from "next/link";

export default function OrderFailurePage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-5xl">😕</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-brand-dark">
        Não foi possível concluir o pagamento
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Nenhuma cobrança foi feita. As peças continuam na sua sacola, você pode tentar novamente.
      </p>
      <Link
        href="/carrinho"
        className="mt-8 inline-block rounded-full bg-brand-dark px-6 py-3 text-sm font-medium text-white hover:bg-black"
      >
        Voltar para a sacola
      </Link>
    </div>
  );
}
