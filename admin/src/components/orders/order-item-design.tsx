import type { OrderItem } from "@/lib/api/types";

/**
 * Shows how a customer delivered (or plans to deliver) this line item's
 * artwork — a link they pasted, a note that they're emailing it separately,
 * or a real download for a file they uploaded (proxied through
 * /api/order-items/[id]/design-file so the Sanctum token, which only lives
 * in an httpOnly cookie, gets attached server-side).
 */
export function OrderItemDesign({ item }: { item: OrderItem }) {
  if (!item.design_delivery_method) {
    return <p className="text-xs text-ink-400">No design file provided yet.</p>;
  }

  if (item.design_delivery_method === "link" && item.design_reference) {
    return (
      <a
        href={item.design_reference}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-accent-100 bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700 hover:bg-accent-100"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.5 14.5l5-5M8 11l-2 2a3 3 0 004.24 4.24l2-2M16 13l2-2a3 3 0 00-4.24-4.24l-2 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Open design link
      </a>
    );
  }

  if (item.design_delivery_method === "email") {
    return (
      <p className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-600">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Customer is emailing this file separately
      </p>
    );
  }

  if (item.design_delivery_method === "upload" && item.design_reference) {
    return (
      <a
        href={`/api/order-items/${item.id}/design-file`}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-success-bg bg-success-bg px-2.5 py-1 text-xs font-semibold text-success hover:opacity-80"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 16V4M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Download {item.design_original_filename ?? "design file"}
      </a>
    );
  }

  return null;
}
