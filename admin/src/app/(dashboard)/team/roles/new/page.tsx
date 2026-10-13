import Link from "next/link";
import { RoleForm } from "@/components/team/role-form";

export const metadata = { title: "Add role" };

export default function NewRolePage() {
  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div>
        <Link href="/team" className="text-sm text-accent-600 hover:underline">
          ← Team
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink-900">Add a role</h1>
        <p className="mt-1 text-sm text-ink-500">
          Name it, then tick what people with this role can open. You can change it any time — it applies at once.
        </p>
      </div>
      <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
        <RoleForm />
      </div>
    </div>
  );
}
