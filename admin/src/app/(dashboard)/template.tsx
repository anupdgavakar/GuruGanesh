import { headers } from "next/headers";
import Link from "next/link";
import { getCurrentUser } from "@/lib/api/auth";
import { hasPermission, permissionForPath } from "@/lib/permissions";

/**
 * A template (unlike the layout) runs again on every page change, so this is
 * where the signed-in person's role is checked against the page they asked
 * for. The API refuses the same requests anyway — this just shows a clear
 * message instead of a broken screen.
 */
export default async function DashboardTemplate({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "/";
  const needed = permissionForPath(pathname);

  if (needed) {
    const user = await getCurrentUser();

    if (!hasPermission(user, needed)) {
      return (
        <div className="mx-auto mt-16 max-w-md rounded-card border border-ink-200 bg-white p-8 text-center shadow-card">
          <h1 className="font-display text-xl font-semibold text-ink-900">You don&apos;t have access to this page</h1>
          <p className="mt-2 text-sm text-ink-600">
            {user ? `Your role (${user.role_name}) can't open this section.` : "Please sign in again."} Ask an admin if
            you need it.
          </p>
          <Link href="/" className="mt-5 inline-flex h-9 items-center rounded-lg bg-accent-600 px-4 text-sm font-medium text-white hover:bg-accent-700">
            Back to the dashboard
          </Link>
        </div>
      );
    }
  }

  return <>{children}</>;
}
