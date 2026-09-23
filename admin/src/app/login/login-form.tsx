"use client";

import { useActionState } from "react";
import { loginAction, type LoginFormState } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";

const initialState: LoginFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-ink-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-danger">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-ink-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
        />
        {state.fieldErrors?.password && (
          <p className="text-xs text-danger">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
