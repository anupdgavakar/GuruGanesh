"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { adminApiFetch, AdminApiError } from "@/lib/api/client";
import { getResourceConfig } from "@/lib/resources/configs";
import type { ResourceConfig } from "@/lib/resources/types";

export interface ResourceFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * An unchecked HTML checkbox is simply absent from FormData — there's no
 * "false" value the browser sends. Every boolean field the config declares
 * needs an explicit 0/1 so Laravel's `boolean` rule (and the column itself)
 * gets a real value instead of silently keeping whatever it was before.
 */
function normalizeBooleans(formData: FormData, config: ResourceConfig) {
  for (const field of config.fields) {
    if (field.type === "boolean") {
      formData.set(field.name, formData.has(field.name) ? "1" : "0");
    }
  }
}

/**
 * A relation <select>'s "— none —" option submits "" — Laravel's
 * `exists:...` rule rejects an empty string outright, even when the field is
 * also `nullable`. Drop the key entirely so it's genuinely absent, which
 * `nullable`/`sometimes` rules do accept.
 */
function dropEmptyRelations(formData: FormData, config: ResourceConfig) {
  for (const field of config.fields) {
    if (field.type === "relation" && formData.get(field.name) === "") {
      formData.delete(field.name);
    }
  }
}

/** An <input type="file"> with nothing chosen still submits an empty File — drop it so "nullable" fields don't choke on it. */
function dropEmptyFiles(formData: FormData, config: ResourceConfig) {
  for (const field of config.fields) {
    if (field.type === "file") {
      const value = formData.get(field.name);
      if (value instanceof File && value.size === 0 && value.name === "") {
        formData.delete(field.name);
      }
    }
  }
}

function prepare(formData: FormData, config: ResourceConfig) {
  normalizeBooleans(formData, config);
  dropEmptyRelations(formData, config);
  dropEmptyFiles(formData, config);
}

export async function createResourceAction(
  configKey: string,
  _prevState: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  const config = getResourceConfig(configKey);
  prepare(formData, config);

  try {
    await adminApiFetch(`/api/${config.endpoint}`, { method: "POST", body: formData });
  } catch (err) {
    if (err instanceof AdminApiError) return { error: err.message, fieldErrors: err.errors };
    return { error: "Could not reach the API." };
  }

  revalidatePath(`/${config.key}`);
  redirect(`/${config.key}` as Route);
}

export async function updateResourceAction(
  configKey: string,
  recordKeyValue: string,
  _prevState: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  const config = getResourceConfig(configKey);
  prepare(formData, config);

  try {
    // POST, not PUT — routes/api.php maps POST to `update` specifically so
    // multipart file uploads work; PHP never parses multipart PUT bodies.
    await adminApiFetch(`/api/${config.endpoint}/${encodeURIComponent(recordKeyValue)}`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    if (err instanceof AdminApiError) return { error: err.message, fieldErrors: err.errors };
    return { error: "Could not reach the API." };
  }

  revalidatePath(`/${config.key}`);
  redirect(`/${config.key}` as Route);
}

export async function deleteResourceAction(configKey: string, recordKeyValue: string): Promise<void> {
  const config = getResourceConfig(configKey);
  await adminApiFetch(`/api/${config.endpoint}/${encodeURIComponent(recordKeyValue)}`, { method: "DELETE" });
  revalidatePath(`/${config.key}`);
}

/**
 * One-click row toggle for a config's `featuredToggle.field` (e.g. products'
 * `is_featured`) — a plain JSON PUT, no full form resubmission needed since
 * UpdateProductRequest treats every field as optional-when-present.
 *
 * Enforces `featuredToggle.max` when turning a row ON: counts how many are
 * currently on via the API's own filter query param, so the cap always
 * reflects what other admins have set too, not just this page's stale rows.
 */
export async function toggleFeaturedAction(
  configKey: string,
  recordKeyValue: string,
  next: boolean,
): Promise<{ error?: string }> {
  const config = getResourceConfig(configKey);
  const toggle = config.featuredToggle;
  if (!toggle) throw new Error(`${configKey} has no featuredToggle configured.`);

  if (next && toggle.max) {
    const queryParam = toggle.queryParam ?? toggle.field;
    const listRes = await adminApiFetch<{ data: { total?: number; data?: unknown[] } }>(
      `/api/${config.endpoint}?${queryParam}=1&per_page=1`,
    );
    const current = listRes.data.total ?? listRes.data.data?.length ?? 0;

    if (current >= toggle.max) {
      return {
        error: `You can only feature ${toggle.max} products on the homepage at once. Remove one before adding another.`,
      };
    }
  }

  try {
    await adminApiFetch(`/api/${config.endpoint}/${encodeURIComponent(recordKeyValue)}`, {
      method: "PUT",
      body: { [toggle.field]: next },
    });
  } catch (err) {
    return { error: err instanceof AdminApiError ? err.message : "Could not reach the API." };
  }

  revalidatePath(`/${config.key}`);
  return {};
}
