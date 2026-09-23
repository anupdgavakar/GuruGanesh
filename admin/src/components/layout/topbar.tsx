import { logoutAction } from "@/actions/auth-actions";
import type { AdminUser } from "@/lib/api/types";

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function Topbar({ user }: { user: AdminUser }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-ink-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-accent-600 text-xs font-bold text-white">
            {initials(user.name)}
          </span>
          <div className="text-right">
            <p className="text-sm font-medium text-ink-900">{user.name}</p>
            <p className="text-xs capitalize text-ink-500">{user.role}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-sm text-ink-700 transition-colors hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
