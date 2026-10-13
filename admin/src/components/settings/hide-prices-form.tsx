"use client";

import { useState, useTransition } from "react";
import { updateSettingsAction } from "@/actions/settings-actions";

/** One switch: hide every price on the website, so customers have to ask. */
export function HidePricesForm({ initial }: { initial: boolean }) {
  const [hidden, setHidden] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toggle(next: boolean) {
    const previous = hidden;
    setHidden(next);
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateSettingsAction({ hide_prices: next });
      if (result.error) {
        setHidden(previous);
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <div className="mt-3">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={hidden}
          disabled={pending}
          onChange={(e) => toggle(e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded border-ink-300 accent-accent-600"
        />
        <span className="text-sm text-ink-800">
          <span className="font-semibold">Hide all prices on the website</span>
          <span className="mt-0.5 block text-ink-600">
            Every product shows &quot;Ask for price&quot; and customers send a price request. Turn it off to show prices again
            (products you marked &quot;Ask for price&quot; one by one stay hidden).
          </span>
        </span>
      </label>
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
      {saved && !error ? (
        <p className="mt-2 text-xs font-medium text-success">
          Saved. The website updates within a minute.
        </p>
      ) : null}
    </div>
  );
}
