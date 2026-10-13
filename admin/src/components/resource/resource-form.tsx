"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { ResourceConfig, ResourceField, StaticOption } from "@/lib/resources/types";
import type { ResourceFormState } from "@/actions/resource-actions";
import { Button } from "@/components/ui/button";
import { OptimizedFileInput } from "@/components/ui/optimized-file-input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

const initialState: ResourceFormState = {};

const inputClass =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100";

function renderField(
  field: ResourceField,
  currentValue: unknown,
  record: Record<string, unknown> | null,
  isEdit: boolean,
  relationOptions: Record<string, StaticOption[]>,
) {
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          id={field.name}
          name={field.name}
          required={field.required}
          defaultValue={(currentValue as string) ?? ""}
          rows={4}
          className={inputClass}
        />
      );

    case "richtext":
      return <RichTextEditor name={field.name} defaultValue={(currentValue as string) ?? ""} required={field.required} />;

    case "boolean": {
      // Unchecked boxes are simply absent from FormData — normalizeBooleans
      // in resource-actions.ts fills in the "0" server-side.
      const checked = record ? Boolean(currentValue) : true; // sensible default for a new record
      return (
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <input
            id={field.name}
            name={field.name}
            type="checkbox"
            value="1"
            defaultChecked={checked}
            className="h-4 w-4 rounded border-ink-300 text-accent-600 focus:ring-accent-500"
          />
          {field.label}
        </label>
      );
    }

    case "number":
    case "decimal":
      return (
        <input
          id={field.name}
          name={field.name}
          type="number"
          step={field.type === "decimal" ? "0.01" : "1"}
          required={field.required}
          defaultValue={(currentValue as number | string) ?? ""}
          className={inputClass}
        />
      );

    case "date":
      return (
        <input
          id={field.name}
          name={field.name}
          type="date"
          required={field.required}
          defaultValue={currentValue ? String(currentValue).slice(0, 10) : ""}
          className={inputClass}
        />
      );

    case "select":
      return (
        <select
          id={field.name}
          name={field.name}
          required={field.required}
          defaultValue={(currentValue as string) ?? ""}
          className={inputClass}
        >
          <option value="">— Select —</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "relation": {
      const options = field.relation ? (relationOptions[field.relation.configKey] ?? []) : [];
      return (
        <select
          id={field.name}
          name={field.name}
          required={field.required}
          defaultValue={currentValue != null ? String(currentValue) : ""}
          className={inputClass}
        >
          <option value="">— None —</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    case "file": {
      const currentUrl = field.currentUrlField && record ? (record[field.currentUrlField] as string | null) : null;
      return (
        <div className="flex items-center gap-3">
          {currentUrl && (
            <Image
              src={currentUrl}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded object-cover"
              unoptimized
            />
          )}
          <OptimizedFileInput
            id={field.name}
            name={field.name}
            accept={field.accept}
            // Required only when creating — an edit keeps the existing file
            // if nothing new is chosen.
            required={field.required && !isEdit}
            className="text-sm"
          />
        </div>
      );
    }

    default:
      return (
        <input
          id={field.name}
          name={field.name}
          type="text"
          required={field.required}
          defaultValue={(currentValue as string) ?? ""}
          className={inputClass}
        />
      );
  }
}

export function ResourceForm({
  config,
  record,
  relationOptions,
  action,
}: {
  config: ResourceConfig;
  record: Record<string, unknown> | null;
  relationOptions: Record<string, StaticOption[]>;
  action: (prevState: ResourceFormState, formData: FormData) => Promise<ResourceFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const isEdit = record !== null;

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      {state.error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      {config.fields.map((field) => {
        const currentValue = record ? record[field.name] : undefined;
        const errors = state.fieldErrors?.[field.name];

        return (
          <div key={field.name} className="flex flex-col gap-1">
            {field.type !== "boolean" && (
              <label htmlFor={field.name} className="text-sm font-medium text-ink-700">
                {field.label}
                {field.required && <span className="text-danger"> *</span>}
              </label>
            )}

            {renderField(field, currentValue, record, isEdit, relationOptions)}

            {field.helpText && <p className="text-xs text-ink-500">{field.helpText}</p>}
            {errors && <p className="text-xs text-danger">{errors[0]}</p>}
          </div>
        );
      })}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : `Create ${config.singularLabel.toLowerCase()}`}
        </Button>
        <Link href={`/${config.key}` as Route} className="text-sm text-ink-500 hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
