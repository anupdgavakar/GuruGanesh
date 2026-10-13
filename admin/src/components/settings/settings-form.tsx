"use client";

import { useState, useTransition } from "react";
import { updateSettingsAction } from "@/actions/settings-actions";
import type { SiteSettings } from "@/lib/api/types";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [email, setEmail] = useState(settings.design_submission_email);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateSettingsAction({ design_submission_email: email });
      if (result.error) {
        setError(result.fieldErrors?.design_submission_email?.[0] ?? result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex-1">
        <label htmlFor="design_submission_email" className="sr-only">
          Design submission email
        </label>
        <input
          id="design_submission_email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSaved(false);
          }}
          className={inputClass}
        />
        {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : null}
        {saved && !error ? <p className="mt-1.5 text-xs font-medium text-success">Saved.</p> : null}
      </div>
      <Button type="submit" disabled={pending} className="shrink-0">
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
