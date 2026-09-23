import { adminApiFetch } from "@/lib/api/client";
import type { ResourceConfig } from "@/lib/resources/types";
import { getPath, type Row } from "./resource-cell";
import { ResourceTableClient } from "./resource-table-client";

async function fetchList(config: ResourceConfig): Promise<Row[]> {
  const params = new URLSearchParams();
  if (config.supportsInactiveToggle) {
    params.set(config.inactiveParam ?? "include_inactive", "1");
  }
  if (config.paginated) params.set("per_page", "100");

  const qs = params.toString();
  const path = `/api/${config.endpoint}${qs ? `?${qs}` : ""}`;

  if (config.paginated) {
    const res = await adminApiFetch<{ status: string; data: { data: Row[] } }>(path);
    return res.data.data;
  }

  const res = await adminApiFetch<{ status: string; data: Row[] }>(path);
  return res.data;
}

export interface RelationOption {
  value: string;
  label: string;
}

/** Derives the relation-filter dropdown's options straight from the fetched rows — no extra request. */
function buildRelationOptions(rows: Row[], config: ResourceConfig): RelationOption[] {
  if (!config.relationFilter) return [];
  const { field, labelField = "name" } = config.relationFilter;
  const byValue = new Map<string, string>();

  for (const row of rows) {
    const related = getPath(row, field);
    if (!related || typeof related !== "object") continue;
    const id = (related as Row).id;
    const label = (related as Row)[labelField];
    if (id === undefined || id === null) continue;
    byValue.set(String(id), label ? String(label) : String(id));
  }

  return Array.from(byValue, ([value, label]) => ({ value, label })).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}

export async function ResourceTable({ config }: { config: ResourceConfig }) {
  const rows = await fetchList(config);
  const relationOptions = buildRelationOptions(rows, config);

  return <ResourceTableClient config={config} rows={rows} relationOptions={relationOptions} />;
}
