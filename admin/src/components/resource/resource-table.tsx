import { adminApiFetch } from "@/lib/api/client";
import type { ResourceConfig } from "@/lib/resources/types";
import { getPath, type Row } from "./resource-cell";
import { ResourceTableClient } from "./resource-table-client";

const PAGE_FETCH_SIZE = 100;
/** Safety net so a runaway result set can't loop forever — 5,000 rows is far beyond anything this admin manages today. */
const MAX_FETCH_PAGES = 50;

async function fetchList(config: ResourceConfig): Promise<Row[]> {
  const baseParams = new URLSearchParams();
  if (config.supportsInactiveToggle) {
    baseParams.set(config.inactiveParam ?? "include_inactive", "1");
  }

  if (!config.paginated) {
    const qs = baseParams.toString();
    const res = await adminApiFetch<{ status: string; data: Row[] }>(
      `/api/${config.endpoint}${qs ? `?${qs}` : ""}`,
    );
    return res.data;
  }

  // The list page filters/searches client-side over the full set, so it
  // needs every row, not just the first page — walk pages until the API
  // says there are no more. (Previously this took only the first 100 rows,
  // so anything after that was silently invisible here even though it was
  // a real row the public API could still serve directly.)
  const rows: Row[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const params = new URLSearchParams(baseParams);
    params.set("per_page", String(PAGE_FETCH_SIZE));
    params.set("page", String(page));

    const res = await adminApiFetch<{
      status: string;
      data: { data: Row[]; current_page: number; last_page: number };
    }>(`/api/${config.endpoint}?${params.toString()}`);

    rows.push(...res.data.data);
    lastPage = res.data.last_page;
    page += 1;
  } while (page <= lastPage && page <= MAX_FETCH_PAGES);

  return rows;
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
