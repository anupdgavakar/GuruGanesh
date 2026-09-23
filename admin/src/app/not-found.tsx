import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-ink-50 px-4 text-center">
      <p className="font-display text-5xl font-bold text-accent-500">404</p>
      <h1 className="text-xl font-semibold text-ink-900">We couldn&apos;t find that page</h1>
      <p className="max-w-sm text-sm text-ink-500">It may have been deleted, or the link is out of date.</p>
      <Link href="/" className="mt-2 text-sm font-medium text-accent-600 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
