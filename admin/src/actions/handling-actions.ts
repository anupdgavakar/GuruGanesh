"use server";

import { revalidatePath } from "next/cache";
import { adminApiFetch, AdminApiError } from "@/lib/api/client";

export type HandlingKind = "inquiries" | "orders";

export interface HandlingResult {
  error?: string;
}

function refresh(kind: HandlingKind, id: number) {
  revalidatePath(`/${kind}`);
  revalidatePath(`/${kind}/${id}`);
}

/** Hand a request to a team member, or take the handler off (userId = null). */
export async function assignHandlerAction(kind: HandlingKind, id: number, userId: number | null): Promise<HandlingResult> {
  try {
    await adminApiFetch(`/api/${kind}/${id}/assign`, { method: "PATCH", body: { user_id: userId } });
  } catch (err) {
    if (err instanceof AdminApiError) return { error: err.errors?.user_id?.[0] ?? err.message };
    return { error: "Could not reach the API." };
  }
  refresh(kind, id);
  return {};
}

/** Leave a note on the request's timeline. */
export async function addNoteAction(kind: HandlingKind, id: number, note: string): Promise<HandlingResult> {
  try {
    await adminApiFetch(`/api/${kind}/${id}/notes`, { method: "POST", body: { note } });
  } catch (err) {
    if (err instanceof AdminApiError) return { error: err.errors?.note?.[0] ?? err.message };
    return { error: "Could not reach the API." };
  }
  refresh(kind, id);
  return {};
}
