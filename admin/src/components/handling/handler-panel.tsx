"use client";

import { useState, useTransition } from "react";
import { assignHandlerAction, type HandlingKind } from "@/actions/handling-actions";
import type { Handler } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** "Handled by …" plus, for people allowed to, a dropdown to hand it to someone else. */
export function HandlerPanel({
  kind,
  id,
  assignee,
  assignedAt,
  team,
}: {
  kind: HandlingKind;
  id: number;
  assignee: Handler | null | undefined;
  assignedAt: string | null | undefined;
  /** null = this person can't reassign, so no dropdown. */
  team: Handler[] | null;
}) {
  const [selected, setSelected] = useState<string>(assignee ? String(assignee.id) : "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const unchanged = selected === (assignee ? String(assignee.id) : "");

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await assignHandlerAction(kind, id, selected === "" ? null : Number(selected));
      if (result.error) setError(result.error);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-accent-600 text-sm font-bold text-white"
        >
          {assignee ? assignee.name.charAt(0).toUpperCase() : "?"}
        </span>
        <div>
          {assignee ? (
            <>
              <p className="text-sm font-semibold text-ink-900">
                {assignee.name} <span className="font-normal text-ink-500">· {assignee.role_name}</span>
              </p>
              <p className="text-xs text-ink-500">Handling this{assignedAt ? ` since ${formatDate(assignedAt)}` : ""}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-ink-900">Nobody yet</p>
              <p className="text-xs text-ink-500">The first team member to open or update it will take it.</p>
            </>
          )}
        </div>
      </div>

      {team ? (
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor={`handler-${kind}-${id}`} className="mb-1 block text-xs font-medium text-ink-500">
              Hand over to
            </label>
            <select
              id={`handler-${kind}-${id}`}
              value={selected}
              disabled={pending}
              onChange={(e) => setSelected(e.target.value)}
              className="h-9 min-w-48 rounded-lg border border-ink-200 bg-white px-2.5 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
            >
              <option value="">Nobody</option>
              {team.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} ({person.role_name})
                </option>
              ))}
            </select>
          </div>
          <Button size="sm" className="h-9" disabled={pending || unchanged} onClick={save}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
