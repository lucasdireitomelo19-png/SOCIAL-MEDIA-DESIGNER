const STATUS_STYLES: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800",
  pago: "bg-blue-100 text-blue-800",
  enviado: "bg-indigo-100 text-indigo-800",
  entregue: "bg-emerald-100 text-emerald-800",
  cancelado: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-stone-100 text-stone-700";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
}
