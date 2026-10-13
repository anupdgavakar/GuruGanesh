"use client";

import { useState, type ComponentProps } from "react";
import { optimizeInputFiles, type OptimizeOutcome } from "@/lib/compress-image";

type Props = Omit<ComponentProps<"input">, "type" | "onChange"> & {
  /** Set false for inputs that may carry non-pictures only. Pictures are optimised by default. */
  optimize?: boolean;
  /** Called after optimising, e.g. to tell the surrounding form. */
  onProcessed?: () => void;
};

/**
 * A normal file input that, for pictures, compresses big photos in the
 * browser as soon as they are chosen, before the form is submitted (see
 * lib/compress-image.ts). It says what it did, so you can see it worked.
 * Non-picture files are left alone. Still a plain <input>, so FormData and
 * server actions work exactly as before.
 */
export function OptimizedFileInput({ optimize = true, onProcessed, ...props }: Props) {
  const [outcome, setOutcome] = useState<OptimizeOutcome>({ message: null, warning: null });
  const [busy, setBusy] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!optimize) return;
    const input = e.currentTarget;
    setOutcome({ message: null, warning: null });
    setChosen(input.files?.[0]?.name ?? null);
    setBusy(true);
    // Blocks the form's Save button until compression is done, so the
    // original big file can never be sent by mistake.
    input.setCustomValidity("Still compressing the picture — wait a moment, then save.");
    try {
      setOutcome(await optimizeInputFiles(input));
    } finally {
      input.setCustomValidity("");
      setBusy(false);
      onProcessed?.();
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <input {...props} type="file" onChange={handleChange} />
      {busy && <p className="text-xs text-ink-500">Compressing {chosen ?? "picture"}… please wait before saving.</p>}
      {!busy && outcome.message && <p className="text-xs text-emerald-700">{outcome.message}</p>}
      {!busy && !outcome.message && chosen && !outcome.warning && (
        <p className="text-xs text-ink-500">Picture is already small enough — no compression needed.</p>
      )}
      {!busy && outcome.warning && <p className="text-xs text-danger">{outcome.warning}</p>}
    </div>
  );
}
