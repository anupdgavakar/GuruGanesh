export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        aria-hidden
        className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
