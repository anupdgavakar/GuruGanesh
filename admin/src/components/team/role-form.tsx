"use client";

import { useState, useTransition } from "react";
import { createRoleAction, deleteRoleAction, updateRoleAction, type RoleFormResult } from "@/actions/role-actions";
import type { RoleDefinition } from "@/lib/api/types";
import { describePermissions, permissionOptions } from "@/lib/permissions";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 disabled:bg-ink-50 disabled:text-ink-500";

/** Create a role, or edit one (pass `role`). The Admin role is shown read-only. */
export function RoleForm({ role }: { role?: RoleDefinition }) {
  const editing = Boolean(role);
  const locked = role?.key === "admin";

  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [permissions, setPermissions] = useState<string[]>(role?.permissions.filter((p) => p !== "users") ?? []);
  const [result, setResult] = useState<RoleFormResult>({});
  const [pending, startTransition] = useTransition();

  const toggle = (value: string) =>
    setPermissions((current) => (current.includes(value) ? current.filter((p) => p !== value) : [...current, value]));
  const fieldError = (field: string) => result.fieldErrors?.[field]?.[0];

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult({});
    startTransition(async () => {
      const values = { name, description, permissions };
      const res = role ? await updateRoleAction(role.id, values) : await createRoleAction(values);
      if (res) setResult(res);
    });
  }

  function remove() {
    if (!role || !window.confirm(`Delete the role "${role.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteRoleAction(role.id);
      if (res) setResult(res);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {locked ? (
        <p className="rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-700">
          The Admin role always has full access, so it can&apos;t be changed — this keeps you from locking yourself out.
        </p>
      ) : null}

      <div>
        <label htmlFor="role-name" className="mb-1 block text-sm font-medium text-ink-800">
          Role name
        </label>
        <input
          id="role-name"
          required
          maxLength={80}
          disabled={locked}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Front desk"
          className={inputClass}
        />
        {fieldError("name") ? <p className="mt-1 text-xs text-danger">{fieldError("name")}</p> : null}
      </div>

      <div>
        <label htmlFor="role-description" className="mb-1 block text-sm font-medium text-ink-800">
          Description
        </label>
        <textarea
          id="role-description"
          rows={2}
          maxLength={300}
          disabled={locked}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What this role is for. Leave empty to show a list of what it can use."
          className={inputClass}
        />
      </div>

      <fieldset disabled={locked}>
        <legend className="mb-2 text-sm font-medium text-ink-800">What can this role open?</legend>
        <div className="flex flex-col gap-2.5">
          {permissionOptions.map((option) => (
            <label key={option.value} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={locked || permissions.includes(option.value)}
                onChange={() => toggle(option.value)}
                className="mt-0.5 h-5 w-5 rounded border-ink-300 accent-accent-600"
              />
              <span className="text-sm text-ink-800">
                <span className="font-semibold">{option.label}</span>
                <span className="block text-ink-600">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {fieldError("permissions") || fieldError("permissions.0") ? (
          <p className="mt-1 text-xs text-danger">{fieldError("permissions") ?? fieldError("permissions.0")}</p>
        ) : null}
        {!locked ? <p className="mt-3 text-xs text-ink-500">Now: {describePermissions(permissions)}</p> : null}
      </fieldset>

      {result.error && !result.fieldErrors?.name && !result.fieldErrors?.permissions ? (
        <p className="text-sm text-danger">{result.error}</p>
      ) : null}

      {!locked ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : editing ? "Save changes" : "Create role"}
          </Button>
          {role && !role.is_system ? (
            <Button type="button" variant="danger" disabled={pending} onClick={remove} className="ml-auto">
              Delete role
            </Button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
