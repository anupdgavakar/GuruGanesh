"use client";

import { useState, useTransition } from "react";
import {
  createTeamMemberAction,
  deleteTeamMemberAction,
  updateTeamMemberAction,
  type TeamFormResult,
} from "@/actions/team-actions";
import type { RoleDefinition, TeamMember } from "@/lib/api/types";
import { describePermissions } from "@/lib/permissions";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 disabled:bg-ink-50 disabled:text-ink-500";

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-ink-800">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

/** Create a team member, or edit one (pass `member`). */
export function TeamMemberForm({
  roles: allRoles,
  member,
  isSelf = false,
}: {
  roles: RoleDefinition[];
  member?: TeamMember;
  isSelf?: boolean;
}) {
  const editing = Boolean(member);
  // The older shared "staff" role can be kept on an existing account but never given to a new one.
  const roles = allRoles
    .filter((role) => role.key !== "staff" || member?.role === "staff")
    .map((role) => ({
      value: role.key,
      label: role.name,
      description: role.description || describePermissions(role.permissions),
    }));

  const [values, setValues] = useState({
    name: member?.name ?? "",
    email: member?.email ?? "",
    phone: member?.phone ?? "",
    role: member?.role ?? roles.find((role) => role.value === "sales")?.value ?? roles[0]?.value ?? "",
    password: "",
    is_active: member?.is_active ?? true,
  });
  const [result, setResult] = useState<TeamFormResult>({});
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((previous) => ({ ...previous, [key]: value }));
  const fieldError = (name: string) => result.fieldErrors?.[name]?.[0];
  const roleInfo = roles.find((role) => role.value === values.role);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult({});
    startTransition(async () => {
      // On success the action redirects to the Team list, so we only get a result back for errors.
      const res = member
        ? await updateTeamMemberAction(member.id, values)
        : await createTeamMemberAction({ ...values, is_active: undefined });
      if (res) setResult(res);
    });
  }

  function remove() {
    if (!member) return;
    if (!window.confirm(`Delete ${member.name}? Their name stays on the history of what they handled. Switching them off instead keeps the account.`)) return;
    startTransition(async () => {
      const res = await deleteTeamMemberAction(member.id);
      if (res) setResult(res);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Full name" htmlFor="name" error={fieldError("name")}>
        <input id="name" required value={values.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Email (used to sign in)" htmlFor="email" error={fieldError("email")}>
        <input
          id="email"
          type="email"
          required
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Phone (optional)" htmlFor="phone" error={fieldError("phone")} hint="Digits only, with country code if you like, e.g. +91 98765 43210.">
        <input id="phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Role" htmlFor="role" error={fieldError("role")} hint={roleInfo?.description}>
        <select
          id="role"
          value={values.role}
          disabled={isSelf}
          onChange={(e) => set("role", e.target.value)}
          className={inputClass}
        >
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        {isSelf ? <p className="mt-1 text-xs text-ink-500">You can&apos;t change your own role.</p> : null}
      </Field>

      <Field
        label={editing ? "New password" : "Password"}
        htmlFor="password"
        error={fieldError("password")}
        hint={
          editing
            ? "Leave empty to keep the current password. Setting a new one signs them out everywhere."
            : "At least 8 characters. Tell the person this password — they sign in with their email and this."
        }
      >
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required={!editing}
          minLength={8}
          value={values.password}
          onChange={(e) => set("password", e.target.value)}
          className={inputClass}
        />
      </Field>

      {editing ? (
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={values.is_active}
            disabled={isSelf}
            onChange={(e) => set("is_active", e.target.checked)}
            className="mt-0.5 h-5 w-5 rounded border-ink-300 accent-accent-600"
          />
          <span className="text-sm text-ink-800">
            <span className="font-semibold">Account is active</span>
            <span className="block text-ink-600">
              Untick to stop this person signing in (e.g. when they leave). Their history stays.
            </span>
          </span>
        </label>
      ) : null}

      {result.error && !result.fieldErrors ? <p className="text-sm text-danger">{result.error}</p> : null}
      {result.error && result.fieldErrors && Object.keys(result.fieldErrors).length === 0 ? (
        <p className="text-sm text-danger">{result.error}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : editing ? "Save changes" : "Create team member"}
        </Button>
        {editing && !isSelf ? (
          <Button type="button" variant="danger" disabled={pending} onClick={remove} className="ml-auto">
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}
