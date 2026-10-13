"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApiFetch, AdminApiError } from "@/lib/api/client";

export interface TeamFormValues {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  is_active?: boolean;
}

export interface TeamFormResult {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function toBody(values: TeamFormValues) {
  const body: Record<string, unknown> = {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim() || null,
    role: values.role,
  };
  if (values.password) body.password = values.password;
  if (values.is_active !== undefined) body.is_active = values.is_active;
  return body;
}

function failure(err: unknown): TeamFormResult {
  if (err instanceof AdminApiError) return { error: err.message, fieldErrors: err.errors };
  return { error: "Could not reach the API." };
}

export async function createTeamMemberAction(values: TeamFormValues): Promise<TeamFormResult> {
  try {
    await adminApiFetch("/api/users", { method: "POST", body: toBody(values) });
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/team");
  redirect("/team");
}

export async function updateTeamMemberAction(id: number, values: TeamFormValues): Promise<TeamFormResult> {
  try {
    await adminApiFetch(`/api/users/${id}`, { method: "PATCH", body: toBody(values) });
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/team");
  redirect("/team");
}

export async function deleteTeamMemberAction(id: number): Promise<TeamFormResult> {
  try {
    await adminApiFetch(`/api/users/${id}`, { method: "DELETE" });
  } catch (err) {
    return failure(err);
  }
  revalidatePath("/team");
  redirect("/team");
}
