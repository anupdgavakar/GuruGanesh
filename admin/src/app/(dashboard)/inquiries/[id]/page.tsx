import { notFound } from "next/navigation";
import { adminApiFetch, AdminApiError } from "@/lib/api/client";
import type { ApiResource, ContactInquiry } from "@/lib/api/types";
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

  return (
    <div className="flex max-w-2xl flex-col gap-5">
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
          <dt className="text-ink-500">Email</dt>
          <dd>
            <a href={`mailto:${inquiry.email}`} className="text-accent-600 hover:underline">
              {inquiry.email}
            </a>
          </dd>
          {inquiry.phone && (
            <>
              <dt className="text-ink-500">Phone</dt>
              <dd className="text-ink-900">{inquiry.phone}</dd>
            </>
          )}
        </dl>
        <p className="mt-4 whitespace-pre-wrap text-sm text-ink-900">{inquiry.message}</p>
      </div>

      <InquiryActions inquiry={inquiry} />
    </div>
  );
}
