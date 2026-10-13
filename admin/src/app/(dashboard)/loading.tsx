/** Shown the instant a sidebar link is clicked, while the next page loads its data. */
export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-5">
      <div className="h-7 w-48 animate-pulse rounded-lg bg-ink-200" />
      <div className="rounded-card border border-ink-200 bg-white p-4 shadow-card">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-ink-100" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
