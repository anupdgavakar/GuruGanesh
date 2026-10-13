"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApiFetch, AdminApiError } from "@/lib/api/client";

export interface RoleFormValues {
  name: string;
  description: string;
  permissions: string[];
}

export interface RoleFormResult {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function failure(err: unknown): RoleFormResult {
  if (err instanceof AdminApiError) return { error: err.message, fieldErrors: err.errors };
  return { error: "Could not reach the API." };
}

const body = (values: RoleFormValues) => ({
  name: values.name.trim(),
  description: values.description.trim() || null,
  permissions: values.permissions,
});

export async function createRoleAction(values: RoleFormValues): Promise<RoleFormResult> {
  try {
    await adminApiFetch("/api/roles", { method: "POST", body: body(values) });
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/team");
  redirect("/team");
}

export async function updateRoleAction(id: number, values: RoleFormValues): Promise<RoleFormResult> {
  try {
    await adminApiFetch(`/api/roles/${id}`, { method: "PATCH", body: body(values) });
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/team");
  redirect("/team");
}

export async function deleteRoleAction(id: number): Promise<RoleFormResult> {
  try {
    await adminApiFetch(`/api/roles/${id}`, { method: "DELETE" });
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/team");
  redirect("/team");
}
