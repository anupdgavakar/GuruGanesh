"use client";

import { useState, useTransition } from "react";
import { addNoteAction, type HandlingKind } from "@/actions/handling-actions";
import { Button } from "@/components/ui/button";

/** An internal note — only the team sees it; the customer never does. */
export function NoteForm({ kind, id }: { kind: HandlingKind; id: number }) {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!note.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addNoteAction(kind, id, note.trim());
      if (result.error) {
        setError(result.error);
        return;
      }
      setNote("");
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label htmlFor={`note-${kind}-${id}`} className="text-xs font-medium text-ink-500">
        Add a note (only your team sees this)
      </label>
      <textarea
        id={`note-${kind}-${id}`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        maxLength={2000}
        placeholder="e.g. Called the customer, will confirm the price tomorrow."
        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending || !note.trim()}>
          {pending ? "Adding…" : "Add note"}
        </Button>
        {error ? <p className="text-xs text-danger">{error}</p> : null}
      </div>
    </form>
  );
}
