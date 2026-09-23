"use client";
// REVERT-TEST-1790147705

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import type { ResourceConfig } from "@/lib/resources/types";
import { Cell, getPath, rowLabel, type Row } from "./resource-cell";
import { Button } from "@/components/ui/button";
import { DeleteRowButton } from "./delete-row-button";
import { FeaturedToggleButton } from "./featured-toggle-button";
import { ChevronDownIcon, PencilIcon, SearchIcon, XIcon } from "./resource-icons";
import type { RelationOption } from "./resource-table";

const ALL = "all";

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-lg border border-ink-200 bg-white py-0 pl-3 pr-8 text-sm text-ink-700 outline-none transition-colors hover:border-ink-300 focus:border-accent-400"
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
    </div>
  );
}

export function ResourceTableClient({
  config,
  rows,
  relationOptions,
}: {
  config: ResourceConfig;
  rows: Row[];
  relationOptions: RelationOption[];
}) {
  const [query, setQuery] = useState("");
  const [relationValue, setRelationValue] = useState(ALL);
  const [statusValue, setStatusValue] = useState(ALL);
  const [featuredValue, setFeaturedValue] = useState(ALL);

  const searchableKeys = useMemo(
    () => config.columns.filter((col) => !col.type || col.type === "text").map((col) => col.key),
    [config.columns],
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (q) {
        const haystack = searchableKeys
          .map((key) => getPath(row, key))
          .concat(rowLabel(row, config.recordKey))
          .filter((v) => v !== null && v !== undefined)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (config.relationFilter && relationValue !== ALL) {
        const related = getPath(row, config.relationFilter.field);
        const id = related && typeof related === "object" ? (related as Row).id : undefined;
        if (String(id ?? "") !== relationValue) return false;
      }

      if (config.supportsInactiveToggle && statusValue !== ALL) {
        const isActive = Boolean(row.status);
        if (statusValue === "active" && !isActive) return false;
        if (statusValue === "inactive" && isActive) return false;
      }

      if (config.featuredToggle && featuredValue !== ALL) {
        const isFeatured = Boolean(getPath(row, config.featuredToggle.field));
        if (featuredValue === "featured" && !isFeatured) return false;
        if (featuredValue === "not-featured" && isFeatured) return false;
      }

      return true;
    });
  }, [rows, query, relationValue, statusValue, featuredValue, searchableKeys, config]);

  const hasActiveFilters =
    query.trim() !== "" || relationValue !== ALL || statusValue !== ALL || featuredValue !== ALL;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-semibold text-ink-900">{config.label}</h1>
          <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-600">
            {hasActiveFilters ? `${filteredRows.length} of ${rows.length}` : rows.length}
          </span>
        </div>
        <Link href={`/${config.key}/new` as Route}>
          <Button>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            New {config.singularLabel.toLowerCase()}
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 rounded-card border border-ink-200 bg-white p-3 shadow-card">
        <div className="relative min-w-[200px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${config.label.toLowerCase()}…`}
            className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-300 hover:border-ink-300 focus:border-accent-400"
          />
        </div>

        {config.relationFilter && relationOptions.length > 0 && (
          <Select value={relationValue} onChange={setRelationValue}>
            <option value={ALL}>All {config.relationFilter.label.toLowerCase()}s</option>
            {relationOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        )}

        {config.supportsInactiveToggle && (
          <Select value={statusValue} onChange={setStatusValue}>
            <option value={ALL}>All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        )}

        {config.featuredToggle && (
          <Select value={featuredValue} onChange={setFeaturedValue}>
            <option value={ALL}>All products</option>
            <option value="featured">Featured</option>
            <option value="not-featured">Not featured</option>
          </Select>
        )}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setRelationValue(ALL);
              setStatusValue(ALL);
              setFeaturedValue(ALL);
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <XIcon />
            Clear
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-card border border-ink-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
              {config.columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && rows.length === 0 && (
              <tr>
                <td colSpan={config.columns.length + 1} className="px-4 py-12 text-center">
                  <p className="text-ink-500">No {config.label.toLowerCase()} yet.</p>
                  <Link
                    href={`/${config.key}/new` as Route}
                    className="mt-2 inline-block text-sm font-semibold text-accent-600 hover:underline"
                  >
                    Create the first one
                  </Link>
                </td>
              </tr>
            )}
            {filteredRows.length === 0 && rows.length > 0 && (
              <tr>
                <td colSpan={config.columns.length + 1} className="px-4 py-12 text-center">
                  <p className="text-ink-500">No {config.label.toLowerCase()} match these filters.</p>
                </td>
              </tr>
            )}
            {filteredRows.map((row) => {
              const recordKeyValue = String(row[config.recordKey]);
              const label = rowLabel(row, config.recordKey);

              return (
                <tr key={recordKeyValue} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                  {config.columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Cell value={getPath(row, col.key)} type={col.type} />
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {config.featuredToggle ? (
                        <FeaturedToggleButton
                          configKey={config.key}
                          recordKeyValue={recordKeyValue}
                          label={label}
                          active={Boolean(getPath(row, config.featuredToggle.field))}
                          onLabel={config.featuredToggle.onLabel}
                          offLabel={config.featuredToggle.offLabel}
                        />
                      ) : null}
                      <Link
                        href={`/${config.key}/${encodeURIComponent(recordKeyValue)}` as Route}
                        title={`Edit "${label}"`}
                        aria-label={`Edit ${label}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-accent-50 hover:text-accent-700"
                      >
                        <PencilIcon />
                      </Link>
                      <DeleteRowButton configKey={config.key} recordKeyValue={recordKeyValue} label={label} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
