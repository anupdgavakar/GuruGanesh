"use server";

import { revalidatePath } from "next/cache";
import { adminApiFetch, AdminApiError } from "@/lib/api/client";
import type { ResourceFormState } from "./resource-actions";

export async function uploadMediaAction(
  _prevState: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  try {
    await adminApiFetch("/api/media", { method: "POST", body: formData });
  } catch (err) {
    if (err instanceof AdminApiError) return { error: err.message, fieldErrors: err.errors };
    return { error: "Could not reach the API." };
  }

  revalidatePath("/media");
  return {};
}

export async function renameMediaAction(
  id: number,
  _prevState: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  try {
    // POST (not PUT) — same multipart-safe update route every catalog
    // resource uses. UpdateMediaRequest's `title` rule is `sometimes`, so a
    // title-only body is a valid partial update.
    await adminApiFetch(`/api/media/${id}`, { method: "POST", body: formData });
  } catch (err) {
    if (err instanceof AdminApiError) return { error: err.message, fieldErrors: err.errors };
    return { error: "Could not reach the API." };
  }

  revalidatePath("/media");
  return {};
}

export async function deleteMediaAction(id: number): Promise<void> {
  await adminApiFetch(`/api/media/${id}`, { method: "DELETE" });
  revalidatePath("/media");
}
