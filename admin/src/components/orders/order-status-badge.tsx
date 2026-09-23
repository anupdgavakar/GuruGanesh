import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/api/types";

const toneByStatus: Record<OrderStatus, "warning" | "neutral" | "success" | "danger"> = {
  pending_review: "warning",
  confirmed: "neutral",
  processing: "neutral",
  completed: "success",
  cancelled: "danger",
};

const labelByStatus: Record<OrderStatus, string> = {
  pending_review: "Pending review",
  confirmed: "Confirmed",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={toneByStatus[status]}>{labelByStatus[status]}</Badge>;
}
