import Image from "next/image";
import type { ResourceColumn } from "@/lib/resources/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type Row = Record<string, unknown>;

export function getPath(obj: Row, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Row)[key];
    return undefined;
  }, obj);
}

/** Best-effort human label for a row, used in delete confirmations and search fallbacks. */
export function rowLabel(row: Row, recordKey: string) {
  return String(row.name ?? row.title ?? row.customer_name ?? row[recordKey]);
}

export function Cell({ value, type }: { value: unknown; type?: ResourceColumn["type"] }) {
  if (type === "image") {
    return value ? (
      <Image
        src={value as string}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 rounded-lg border border-ink-100 object-cover"
        unoptimized
      />
    ) : (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-ink-200 text-ink-300">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 16l5-5 4 4 5-6 4 5" />
        </svg>
      </div>
    );
  }

  if (value === null || value === undefined || value === "") {
    return <span className="text-ink-300">—</span>;
  }

  switch (type) {
    case "boolean":
      return value ? <Badge tone="success">Yes</Badge> : <Badge tone="neutral">No</Badge>;
    case "price":
      return <span className="font-medium text-ink-900">{formatPrice(value as number | string)}</span>;
    case "date":
      return <span>{formatDate(value as string)}</span>;
    default:
      return <span>{String(value)}</span>;
  }
}
