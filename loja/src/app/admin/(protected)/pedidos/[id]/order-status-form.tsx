"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/actions/order-actions";
import { orderStatusLabels } from "@/lib/site-config";

const statuses = Object.keys(orderStatusLabels);

export default function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-3 flex items-center gap-3">
      <select
        defaultValue={currentStatus}
        disabled={isPending}
        onChange={(event) => {
          const status = event.target.value;
          startTransition(() => updateOrderStatus(orderId, status));
        }}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {orderStatusLabels[status]}
          </option>
        ))}
      </select>
      {isPending && <span className="text-xs text-neutral-400">Salvando...</span>}
    </div>
  );
}
