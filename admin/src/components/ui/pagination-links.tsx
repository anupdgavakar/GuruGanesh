import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

/** Page numbers to show: always first/last, a window around the current page, "…" for gaps. */
function pageList(current: number, total: number): (number | "gap")[] {
  const keep = new Set([1, total, current - 1, current, current + 1]);
  const nums = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

const btn =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-ink-200 px-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50";

/**
 * Link-based pager for server-rendered lists (page number lives in the URL,
 * so it survives refresh and works with the status tabs). `params` are the
 * other query params to keep, e.g. { status: "new" }.
 */
export function PaginationLinks({
  basePath,
  params = {},
  page,
  totalPages,
  totalItems,
  perPage,
}: {
  basePath: string;
  params?: Record<string, string | undefined>;
  page: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number): Route => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return (s ? `${basePath}?${s}` : basePath) as Route;
  };

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
      <p className="text-sm text-ink-500">
        Showing {from}–{to} of {totalItems}
      </p>
      <nav className="flex items-center gap-2" aria-label="Pagination">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={btn}>
            Previous
          </Link>
        ) : (
          <span className={cn(btn, "cursor-not-allowed opacity-40 hover:bg-transparent")}>Previous</span>
        )}
        {pageList(page, totalPages).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-sm text-ink-400">
              …
            </span>
          ) : p === page ? (
            <span
              key={p}
              aria-current="page"
              className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-accent-600 px-2 text-sm font-semibold text-white"
            >
              {p}
            </span>
          ) : (
            <Link key={p} href={hrefFor(p)} className={btn}>
              {p}
            </Link>
          ),
        )}
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} className={btn}>
            Next
          </Link>
        ) : (
          <span className={cn(btn, "cursor-not-allowed opacity-40 hover:bg-transparent")}>Next</span>
        )}
      </nav>
    </div>
  );
}
