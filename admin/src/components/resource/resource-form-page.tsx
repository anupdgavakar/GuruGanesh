import { notFound } from "next/navigation";
import { adminApiFetch, AdminApiError } from "@/lib/api/client";
import { getResourceConfig } from "@/lib/resources/configs";
import { createResourceAction, updateResourceAction } from "@/actions/resource-actions";
import type { ResourceConfig, StaticOption } from "@/lib/resources/types";
import { ResourceForm } from "./resource-form";

async function fetchRecord(config: ResourceConfig, recordKeyValue: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await adminApiFetch<{ status: string; data: Record<string, unknown> }>(
      `/api/${config.endpoint}/${encodeURIComponent(recordKeyValue)}`,
    );
    return res.data;
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 404) return null;
    throw err;
  }
}

/**
 * Every relation target used across the resource configs (categories,
 * subcategories, design modes, delivery options, product types, pricing
 * tiers) is a small, non-paginated, id-keyed lookup table — so a single
 * unfiltered list fetch per related resource is enough to populate the
 * dropdown, no pagination handling needed here.
 */
async function fetchRelationOptions(config: ResourceConfig): Promise<Record<string, StaticOption[]>> {
  const relationFields = config.fields.filter((f) => f.type === "relation" && f.relation);
  const uniqueConfigKeys = [...new Set(relationFields.map((f) => f.relation!.configKey))];

  const entries = await Promise.all(
    uniqueConfigKeys.map(async (key) => {
      const relatedConfig = getResourceConfig(key);
      const labelField = relationFields.find((f) => f.relation!.configKey === key)!.relation!.labelField;

      try {
        const res = await adminApiFetch<{ status: string; data: Record<string, unknown>[] }>(
          `/api/${relatedConfig.endpoint}`,
        );
        const options: StaticOption[] = res.data.map((row) => ({
          value: String(row.id),
          label: String(row[labelField] ?? row.id),
        }));
        return [key, options] as const;
      } catch {
        return [key, []] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function ResourceFormPage({
  configKey,
  recordKeyValue,
}: {
  configKey: string;
  recordKeyValue?: string;
}) {
  const config = getResourceConfig(configKey);
  // Next hands dynamic route params over still percent-encoded ("My%20Post"),
  // and the fetch below encodes again, which turned a key with a space into
  // "My%2520Post" and a false 404. Decode once, here.
  const key = recordKeyValue === undefined ? undefined : safeDecode(recordKeyValue);
  const isEdit = key !== undefined;

  const [record, relationOptions] = await Promise.all([
    isEdit ? fetchRecord(config, key) : Promise.resolve(null),
    fetchRelationOptions(config),
  ]);

  if (isEdit && record === null) notFound();

  const action = isEdit
    ? updateResourceAction.bind(null, configKey, key)
    : createResourceAction.bind(null, configKey);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-ink-900">
        {isEdit ? `Edit ${config.singularLabel.toLowerCase()}` : `New ${config.singularLabel.toLowerCase()}`}
      </h1>
      <ResourceForm config={config} record={record} relationOptions={relationOptions} action={action} />
    </div>
  );
}
