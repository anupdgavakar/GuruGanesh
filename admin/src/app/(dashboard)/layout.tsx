import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // The middleware only checks that a session cookie exists. This is the
  // real check: is the token still valid, and does this account actually
  // have admin-panel access (customer accounts are refused even though
  // they can authenticate against the same /auth/login endpoint).
  const user = await getCurrentUser();

  if (!user || user.role === "customer") {
    redirect("/login");
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto bg-ink-50 p-6">{children}</main>
      </div>
    </div>
  );
}
