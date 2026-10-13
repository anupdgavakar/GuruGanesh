import Link from "next/link";
import { adminApiFetch as fetchApi } from "@/lib/api/client";
import type { ApiListResponse as RoleList, RoleDefinition } from "@/lib/api/types";
import { TeamMemberForm } from "@/components/team/team-member-form";

export const metadata = { title: "Add team member" };

export default async function NewTeamMemberPage() {
  const roles = (await fetchApi<RoleList<RoleDefinition>>("/api/roles")).data;

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div>
        <Link href="/team" className="text-sm text-accent-600 hover:underline">
          ← Team
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink-900">Add team member</h1>
        <p className="mt-1 text-sm text-ink-500">They sign in to this admin panel with their email and password.</p>
      </div>
      <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
        <TeamMemberForm roles={roles} />
      </div>
    </div>
  );
}
