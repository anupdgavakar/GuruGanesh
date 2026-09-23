import Link from "next/link";
import { adminApiFetch } from "@/lib/api/client";
import type { ApiPaginatedListResponse, Order, OrderStatus } from "@/lib/api/types";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatDate, formatPrice, cn } from "@/lib/utils";

export const metadata = { title: "Orders" };

const tabs: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending review", value: "pending_review" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = (status ?? "all") as OrderStatus | "all";

  const qs = activeStatus !== "all" ? `?status=${activeStatus}` : "";
  const res = await adminApiFetch<ApiPaginatedListResponse<Order>>(`/api/orders${qs}`);
  const orders = res.data.data;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Orders</h1>
        <p className="mt-1 text-sm text-ink-500">
          Cart submissions from the public site — confirm details and follow up to collect payment.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-ink-200">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/orders" : `/orders?status=${tab.value}`}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium",
              activeStatus === tab.value
                ? "border-accent-600 text-accent-700"
                : "border-transparent text-ink-500 hover:text-ink-700",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-card border border-ink-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Subtotal</th>
              <th className="px-4 py-3 font-medium">Placed</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-500">
                  No orders here.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                <td className="px-4 py-3">
                  <Link href={`/orders/${order.id}`} className="font-medium text-accent-700 hover:underline">
                    #{order.id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/orders/${order.id}`} className="block">
                    <p className="font-medium text-ink-900">{order.customer_name}</p>
                    <p className="text-xs text-ink-500">{order.customer_email}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-700">
                  {order.items.length} item{order.items.length === 1 ? "" : "s"}
                </td>
                <td className="px-4 py-3 font-semibold text-ink-900">{formatPrice(order.subtotal)}</td>
                <td className="px-4 py-3 text-ink-500">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
