"use client";

import { useTransition } from "react";
import { toggleFeaturedAction } from "@/actions/resource-actions";
import { StarIcon } from "./resource-icons";

export function FeaturedToggleButton({
  configKey,
  recordKeyValue,
  label,
  active,
  onLabel,
  offLabel,
}: {
  configKey: string;
  recordKeyValue: string;
  label: string;
  active: boolean;
  onLabel: string;
  offLabel: string;
}) {
  const [pending, startTransition] = useTransition();
  const title = active ? `${offLabel} — "${label}"` : `${onLabel} — "${label}"`;

  return (
    <button
      type="button"
      disabled={pending}
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={() => {
        startTransition(async () => {
          const res = await toggleFeaturedAction(configKey, recordKeyValue, !active);
          if (res?.error) window.alert(res.error);
        });
      }}
      className={
        active
          ? "inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-500 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
          : "inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 transition-colors hover:bg-ink-100 hover:text-ink-500 disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      {pending ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
          <path d="M21 12a9 9 0 11-9-9" strokeLinecap="round" />
        </svg>
      ) : (
        <StarIcon filled={active} />
      )}
    </button>
  );
}
