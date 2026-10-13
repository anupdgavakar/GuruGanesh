"use server";

import { revalidatePath } from "next/cache";
import { adminApiFetch, AdminApiError } from "@/lib/api/client";
import type { ApiResource, SiteSettings } from "@/lib/api/types";

export interface UpdateSettingsResult {
  data?: SiteSettings;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// AdminApiError never survives the server-action serialization boundary as
// a real class instance on the client (Next.js re-wraps thrown errors), so
// — same pattern as resource-actions.ts — it's caught HERE, server-side,
// and turned into a plain object the client component can read directly.
export async function updateSettingsAction(
  patch: Partial<{ design_submission_email: string; hide_prices: boolean }>,
): Promise<UpdateSettingsResult> {
  try {
    const res = await adminApiFetch<ApiResource<SiteSettings>>("/api/settings", {
      method: "PATCH",
      body: patch,
    });
    revalidatePath("/settings");
    return { data: res.data };
  } catch (err) {
    if (err instanceof AdminApiError) return { error: err.message, fieldErrors: err.errors };
    return { error: "Could not reach the API." };
  }
}
