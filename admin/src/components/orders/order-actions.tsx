"use client";

import { useTransition } from "react";
import { deleteOrderAction, updateOrderStatusAction } from "@/actions/order-actions";
import type { Order, OrderStatus } from "@/lib/api/types";
import { Button } from "@/components/ui/button";

const statuses: { value: OrderStatus; label: string }[] = [
  { value: "pending_review", label: "Pending review" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrderActions({ order }: { order: Order }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {statuses.map((status) => (
        <Button
          key={status.value}
          variant={order.status === status.value ? "primary" : "secondary"}
          size="sm"
          disabled={pending}
          onClick={() => startTransition(() => updateOrderStatusAction(order.id, status.value))}
        >
          {status.label}
        </Button>
      ))}
      <Button
        variant="danger"
        size="sm"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Delete order #${order.id}? This can't be undone.`)) return;
          startTransition(() => deleteOrderAction(order.id));
        }}
      >
        Delete
      </Button>
    </div>
  );
}
