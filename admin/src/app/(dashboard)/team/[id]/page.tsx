import Link from "next/link";
import { notFound } from "next/navigation";
import { adminApiFetch, AdminApiError } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/api/auth";
import type { ApiResource, TeamMember } from "@/lib/api/types";
import { adminApiFetch as fetchApi } from "@/lib/api/client";
import type { ApiListResponse as RoleList, RoleDefinition } from "@/lib/api/types";
import { TeamMemberForm } from "@/components/team/team-member-form";

export const metadata = { title: "Edit team member" };

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let member: TeamMember;
  try {
    member = (await adminApiFetch<ApiResource<TeamMember>>(`/api/users/${id}`)).data;
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 404) notFound();
    throw err;
  }

  const me = await getCurrentUser();
  const roles = (await fetchApi<RoleList<RoleDefinition>>("/api/roles")).data;

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div>
        <Link href="/team" className="text-sm text-accent-600 hover:underline">
          ← Team
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink-900">{member.name}</h1>
      </div>
      <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
        <TeamMemberForm roles={roles} member={member} isSelf={me?.id === member.id} />
      </div>
    </div>
  );
}
