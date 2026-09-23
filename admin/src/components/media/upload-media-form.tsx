"use client";

import { useActionState, useRef, useEffect } from "react";
import { uploadMediaAction } from "@/actions/media-actions";
import type { ResourceFormState } from "@/actions/resource-actions";
import { Button } from "@/components/ui/button";

const initialState: ResourceFormState = {};

export function UploadMediaForm() {
  const [state, formAction, pending] = useActionState(uploadMediaAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-card border border-ink-200 bg-white p-4 shadow-card"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-xs font-medium text-ink-700">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="h-9 w-48 rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="type" className="text-xs font-medium text-ink-700">
          Type
        </label>
        <select
          id="type"
          name="type"
          required
          className="h-9 rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="document">Document</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="file" className="text-xs font-medium text-ink-700">
          File
        </label>
        <input id="file" name="file" type="file" required className="text-sm" />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Uploading…" : "Upload"}
      </Button>

      {state.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
