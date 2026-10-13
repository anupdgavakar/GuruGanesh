import Link from "next/link";
import type { Route } from "next";
import { adminApiFetch } from "@/lib/api/client";
import type { LaravelPage, ContactInquiry, InquiryStatus } from "@/lib/api/types";
import { InquiryStatusBadge } from "@/components/inquiries/inquiry-status-badge";
import { PaginationLinks } from "@/components/ui/pagination-links";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "Inquiries" };

const tabs: { label: string; value: InquiryStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Read", value: "read" },
  { label: "Responded", value: "responded" },
];

const handlerTabs = [
  { label: "Everyone's", value: "all" },
  { label: "Mine", value: "me" },
  { label: "Nobody's yet", value: "none" },
] as const;

function listHref(status: string | undefined, handler: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (handler !== "all") params.set("assigned_to", handler);
  const qs = params.toString();
  return `/inquiries${qs ? `?${qs}` : ""}` as Route;
}

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; assigned_to?: string }>;
}) {
  const { status, page: pageParam, assigned_to: assignedParam } = await searchParams;
  const activeHandler = assignedParam === "me" || assignedParam === "none" ? assignedParam : "all";
  const pageNum = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const activeStatus = (status ?? "all") as InquiryStatus | "all";

  const query = new URLSearchParams();
  if (activeStatus !== "all") query.set("status", activeStatus);
  if (activeHandler !== "all") query.set("assigned_to", activeHandler);
  if (pageNum > 1) query.set("page", String(pageNum));
  const qs = query.toString();
  const res = await adminApiFetch<{ status: string; data: LaravelPage<ContactInquiry> }>(`/api/inquiries${qs ? `?${qs}` : ""}`);
  const inquiries = res.data.data;
  const pager = res.data;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Inquiries</h1>
        <p className="mt-1 text-sm text-ink-500">Contact form submissions from the public site.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {handlerTabs.map((tab) => (
          <Link
            key={tab.value}
            href={listHref(activeStatus === "all" ? undefined : activeStatus, tab.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              activeHandler === tab.value
                ? "border-accent-600 bg-accent-50 text-accent-700"
                : "border-ink-200 text-ink-600 hover:bg-ink-50",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex gap-1 border-b border-ink-200">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={listHref(tab.value === "all" ? undefined : tab.value, activeHandler)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium",
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
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium">Handled by</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-500">
                  No inquiries here.
                </td>
              </tr>
            )}
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                <td className="px-4 py-3">
                  <Link href={`/inquiries/${inquiry.id}`} className="block">
                    <p className="font-medium text-ink-900">{inquiry.name}</p>
                    <p className="text-xs text-ink-500">{inquiry.email ?? inquiry.phone}</p>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/inquiries/${inquiry.id}`}>{inquiry.subject ?? <span className="text-ink-300">—</span>}</Link>
                </td>
                <td className="px-4 py-3 text-ink-500">{formatDate(inquiry.created_at)}</td>
                <td className="px-4 py-3 text-ink-700">
                  {inquiry.assignee ? inquiry.assignee.name : <span className="text-ink-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <InquiryStatusBadge status={inquiry.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationLinks
        basePath="/inquiries"
        params={{ status: activeStatus !== "all" ? activeStatus : undefined, assigned_to: activeHandler !== "all" ? activeHandler : undefined }}
        page={pager.current_page}
        totalPages={pager.last_page}
        totalItems={pager.total}
        perPage={pager.per_page}
      />
    </div>
  );
}
