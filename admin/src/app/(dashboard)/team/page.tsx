import Link from "next/link";
import type { Route } from "next";
import { adminApiFetch } from "@/lib/api/client";
import type { ApiListResponse, RoleDefinition, TeamMember } from "@/lib/api/types";
import { describePermissions } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Team" };

const roleTone = (key: string) => (key === "admin" ? "danger" : key === "manager" || key === "staff" ? "warning" : key === "sales" ? "success" : "neutral");

export default async function TeamPage() {
  const [peopleRes, rolesRes] = await Promise.all([
    adminApiFetch<ApiListResponse<TeamMember>>("/api/users"),
    adminApiFetch<ApiListResponse<RoleDefinition>>("/api/roles"),
  ]);
  const people = peopleRes.data;
  const roles = rolesRes.data;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Team</h1>
          <p className="mt-1 text-sm text-ink-500">
            People who sign in to this admin panel. Their role decides what they can see and do.
          </p>
        </div>
        <Link
          href="/team/new"
          className="inline-flex h-10 items-center rounded-lg bg-accent-600 px-4 text-sm font-medium text-white transition-colors hover:bg-accent-700"
        >
          Add team member
        </Link>
      </div>

      <div className="overflow-x-auto rounded-card border border-ink-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Handling now</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                <td className="px-4 py-3">
                  <Link href={`/team/${person.id}` as Route} className="block">
                    <p className="font-medium text-ink-900">{person.name}</p>
                    <p className="text-xs text-ink-500">
                      {person.email}
                      {person.phone ? ` · ${person.phone}` : ""}
                    </p>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={roleTone(person.role)}>{person.role_name}</Badge>
                </td>
                <td className="px-4 py-3 text-ink-700">
                  {person.inquiries_count ?? 0} inquiries · {person.orders_count ?? 0} orders
                </td>
                <td className="px-4 py-3">
                  <Badge tone={person.is_active ? "success" : "neutral"}>{person.is_active ? "Active" : "Switched off"}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">What each role can do</h2>
            <p className="mt-1 text-sm text-ink-600">
              Edit a role to change what its people can open, or add your own — changes apply at once.
            </p>
          </div>
          <Link
            href={"/team/roles/new" as Route}
            className="inline-flex h-9 items-center rounded-lg border border-ink-200 px-3.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
          >
            Add a role
          </Link>
        </div>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {roles.map((role) => (
            <li key={role.id}>
              <Link
                href={`/team/roles/${role.id}` as Route}
                className="block h-full rounded-xl border border-ink-100 p-4 transition-colors hover:border-accent-200 hover:bg-accent-50/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-ink-900">{role.name}</p>
                  <span className="text-xs text-ink-500">
                    {role.users_count ?? 0} {role.users_count === 1 ? "person" : "people"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-600">{role.description || describePermissions(role.permissions)}</p>
                {role.is_system ? null : <p className="mt-2 text-xs font-medium text-accent-700">Custom role</p>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
