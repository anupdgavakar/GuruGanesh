import { notFound } from "next/navigation";
import { adminApiFetch, AdminApiError } from "@/lib/api/client";
import type { ApiResource, Order } from "@/lib/api/types";
import { HandlingSection } from "@/components/handling/handling-section";
import { getCurrentUser } from "@/lib/api/auth";
import { hasPermission } from "@/lib/permissions";
import { OrderActions } from "@/components/orders/order-actions";
import { OrderItemDesign } from "@/components/orders/order-item-design";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatDate, formatPrice } from "@/lib/utils";

async function fetchOrder(id: string): Promise<Order | null> {
  try {
    const res = await adminApiFetch<ApiResource<Order>>(`/api/orders/${id}`);
    return res.data;
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 404) return null;
    throw err;
  }
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await fetchOrder(id);

  if (!order) notFound();

  const user = await getCurrentUser();

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Order #{order.id}</h1>
          <p className="mt-1 text-sm text-ink-500">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Customer</h2>
        <dl className="mt-2 grid grid-cols-[100px_1fr] gap-y-2 text-sm">
          <dt className="text-ink-500">Name</dt>
          <dd className="text-ink-900">{order.customer_name}</dd>
          <dt className="text-ink-500">Email</dt>
          <dd>
            <a href={`mailto:${order.customer_email}`} className="text-accent-600 hover:underline">
              {order.customer_email}
            </a>
          </dd>
          <dt className="text-ink-500">Phone</dt>
          <dd>
            <a href={`tel:${order.customer_phone}`} className="text-accent-600 hover:underline">
              {order.customer_phone}
            </a>
          </dd>
          {order.shipping_address ? (
            <>
              <dt className="text-ink-500">Ship to</dt>
              <dd className="whitespace-pre-wrap text-ink-900">{order.shipping_address}</dd>
            </>
          ) : null}
        </dl>
        {order.notes ? (
          <>
            <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-ink-500">Notes</h2>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink-900">{order.notes}</p>
          </>
        ) : null}
      </div>

      <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
          Items ({order.items.length})
        </h2>
        <ul className="mt-3 flex flex-col divide-y divide-ink-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex flex-col gap-2 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink-900">{item.product_name}</p>
                  <p className="text-xs text-ink-500">
                    {formatPrice(item.unit_price)} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-ink-900">{formatPrice(item.line_total)}</p>
              </div>
              <OrderItemDesign item={item} />
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-ink-200 pt-3">
          <p className="text-sm font-semibold text-ink-900">Subtotal</p>
          <p className="text-base font-bold text-ink-900">{formatPrice(order.subtotal)}</p>
        </div>
        <p className="mt-2 text-xs text-ink-500">
          No online payment was taken — follow up with the customer directly to collect payment.
        </p>
      </div>

      <HandlingSection
        kind="orders"
        id={order.id}
        assignee={order.assignee}
        assignedAt={order.assigned_at}
        createdAt={order.created_at}
        activities={order.activities}
        receivedLabel="Order placed by the customer"
      />

      <OrderActions order={order} canDelete={hasPermission(user, "delete_records")} />
    </div>
  );
}
