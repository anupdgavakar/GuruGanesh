"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { deleteMediaAction, renameMediaAction } from "@/actions/media-actions";
import type { ResourceFormState } from "@/actions/resource-actions";
import type { Media } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

const initialState: ResourceFormState = {};

export function MediaCard({ media }: { media: Media }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, renamePending] = useActionState(renameMediaAction.bind(null, media.id), initialState);
  const [deletePending, startDeleteTransition] = useTransition();

  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-ink-200 bg-white shadow-card">
      <div className="flex h-32 items-center justify-center bg-ink-50">
        {media.type === "image" && media.url ? (
          <Image src={media.url} alt={media.title} width={128} height={128} className="h-full w-full object-cover" unoptimized />
        ) : (
          <span className="text-xs uppercase tracking-wide text-ink-400">{media.type}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {editing ? (
          <form action={formAction} onSubmit={() => setEditing(false)} className="flex flex-col gap-1">
            <input type="hidden" name="type" value={media.type} />
            <input
              name="title"
              defaultValue={media.title}
              autoFocus
              className="h-8 rounded border border-ink-200 px-2 text-sm outline-none focus:border-accent-500"
            />
            <div className="flex gap-2 text-xs">
              <button type="submit" disabled={renamePending} className="text-accent-600 hover:underline">
                Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="text-ink-500 hover:underline">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="truncate text-sm font-medium text-ink-900" title={media.title}>
            {media.title}
          </p>
        )}

        {state.error && <p className="text-xs text-danger">{state.error}</p>}

        <p className="text-xs text-ink-500">{formatDate(media.created_at)}</p>

        <div className="mt-auto flex items-center justify-between text-xs">
          {media.url && (
            <a href={media.url} target="_blank" rel="noreferrer" className="text-accent-600 hover:underline">
              Open
            </a>
          )}
          <div className="flex gap-3">
            {!editing && (
              <button type="button" onClick={() => setEditing(true)} className="text-ink-500 hover:underline">
                Rename
              </button>
            )}
            <button
              type="button"
              disabled={deletePending}
              onClick={() => {
                if (!window.confirm(`Delete "${media.title}"? This can't be undone.`)) return;
                startDeleteTransition(() => {
                  deleteMediaAction(media.id);
                });
              }}
              className="text-danger hover:underline disabled:text-ink-300"
            >
              {deletePending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
