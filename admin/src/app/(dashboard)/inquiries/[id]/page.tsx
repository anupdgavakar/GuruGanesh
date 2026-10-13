import { notFound } from "next/navigation";
import { adminApiFetch, AdminApiError } from "@/lib/api/client";
import type { ApiResource, ContactInquiry, SiteSettings } from "@/lib/api/types";
import { RequestedProduct } from "@/components/inquiries/requested-product";
import { HandlingSection } from "@/components/handling/handling-section";
import { getCurrentUser } from "@/lib/api/auth";
import { hasPermission } from "@/lib/permissions";
import { InquiryActions } from "@/components/inquiries/inquiry-actions";
import { InquiryStatusBadge } from "@/components/inquiries/inquiry-status-badge";
import { formatDate } from "@/lib/utils";

async function fetchInquiry(id: string): Promise<ContactInquiry | null> {
  try {
    const res = await adminApiFetch<ApiResource<ContactInquiry>>(`/api/inquiries/${id}`);
    return res.data;
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 404) return null;
    throw err;
  }
}

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiry = await fetchInquiry(id);

  if (!inquiry) notFound();

  // Whether prices are switched off for the whole website (shown next to the real price).
  let hideAllPrices = false;
  try {
    const settings = await adminApiFetch<ApiResource<SiteSettings>>("/api/settings");
    hideAllPrices = Boolean(settings.data.hide_prices);
  } catch {
    // Not essential to the page — leave the label off.
  }

  const user = await getCurrentUser();

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">{inquiry.subject ?? "Inquiry"}</h1>
          <p className="mt-1 text-sm text-ink-500">{formatDate(inquiry.created_at)}</p>
        </div>
        <InquiryStatusBadge status={inquiry.status} />
      </div>

      <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
        <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
          <dt className="text-ink-500">Name</dt>
          <dd className="text-ink-900">{inquiry.name}</dd>
          {inquiry.type === "price_request" && (
            <>
              <dt className="text-ink-500">Type</dt>
              <dd className="font-medium text-accent-700">Price request{inquiry.quantity ? ` — quantity ${inquiry.quantity}` : ""}</dd>
            </>
          )}
          {inquiry.email && (
            <>
              <dt className="text-ink-500">Email</dt>
              <dd>
                <a href={`mailto:${inquiry.email}`} className="text-accent-600 hover:underline">
                  {inquiry.email}
                </a>
              </dd>
            </>
          )}
          {inquiry.phone && (
            <>
              <dt className="text-ink-500">Phone</dt>
              <dd className="text-ink-900">{inquiry.phone}</dd>
            </>
          )}
        </dl>
        <p className="mt-4 whitespace-pre-wrap text-sm text-ink-900">{inquiry.message}</p>
      </div>

      <RequestedProduct
        inquiry={inquiry}
        hideAllPrices={hideAllPrices}
        canOpenProduct={hasPermission(user, "catalog")}
      />

      <HandlingSection
        kind="inquiries"
        id={inquiry.id}
        assignee={inquiry.assignee}
        assignedAt={inquiry.assigned_at}
        createdAt={inquiry.created_at}
        activities={inquiry.activities}
        receivedLabel={inquiry.type === "price_request" ? "Price request received" : "Message received"}
      />

      <InquiryActions inquiry={inquiry} canDelete={hasPermission(user, "delete_records")} />
    </div>
  );
}
