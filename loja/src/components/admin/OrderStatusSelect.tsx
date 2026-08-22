"use client";

import { useTransition } from "react";
import { ORDER_STATUSES } from "@/lib/order-schema";
import { updateOrderStatus } from "@/app/admin/(dashboard)/pedidos/actions";

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => {
          updateOrderStatus(orderId, next);
        });
      }}
      className="rounded-md border border-stone-300 px-2 py-1 text-sm capitalize disabled:opacity-60"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s} className="capitalize">
          {s}
        </option>
      ))}
    </select>
  );
}
