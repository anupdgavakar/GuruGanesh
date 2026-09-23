"use client";

import { useTransition } from "react";
import { deleteResourceAction } from "@/actions/resource-actions";
import { TrashIcon } from "./resource-icons";

export function DeleteRowButton({
  configKey,
  recordKeyValue,
  label,
}: {
  configKey: string;
  recordKeyValue: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      title={`Delete "${label}"`}
      aria-label={`Delete ${label}`}
      onClick={() => {
        if (!window.confirm(`Delete "${label}"? This can't be undone.`)) return;
        startTransition(() => {
          deleteResourceAction(configKey, recordKeyValue);
        });
      }}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-danger-bg hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
          <path d="M21 12a9 9 0 11-9-9" strokeLinecap="round" />
        </svg>
      ) : (
        <TrashIcon />
      )}
    </button>
  );
}
