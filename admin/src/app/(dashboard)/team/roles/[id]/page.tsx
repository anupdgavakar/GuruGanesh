import Link from "next/link";
import { notFound } from "next/navigation";
import { adminApiFetch, AdminApiError } from "@/lib/api/client";
import type { ApiResource, RoleDefinition } from "@/lib/api/types";
import { RoleForm } from "@/components/team/role-form";

export const metadata = { title: "Edit role" };

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let role: RoleDefinition;
  try {
    role = (await adminApiFetch<ApiResource<RoleDefinition>>(`/api/roles/${id}`)).data;
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div>
        <Link href="/team" className="text-sm text-accent-600 hover:underline">
          ← Team
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink-900">{role.name}</h1>
      </div>
      <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
        <RoleForm role={role} />
      </div>
    </div>
  );
}
