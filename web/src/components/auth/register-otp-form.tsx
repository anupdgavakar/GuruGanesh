"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { requestOtpAction, skipOtpAction, verifyOtpAction } from "@/actions/auth-actions";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";

const inputClasses =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

type Step = "phone" | "otp";

/**
 * Two-step passwordless sign-in: phone (+ name, only used if this number
 * turns out to be a new account) → a 6-digit code sent to that phone. No
 * SMS gateway is connected yet (see the API's SmsService/OTP_TEST_MODE),
 * so while that's on, the "send code" step also hands back the code
 * itself (shown below) and a "skip verification" bypass appears — both
 * disappear the moment a real gateway is wired in and OTP_TEST_MODE is
 * turned off, with no change needed here.
 */
export function RegisterOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  // e.g. /login?next=/checkout — sent here by a page that requires login.
  // Only ever follow a same-site path (single leading slash, not "//host")
  // so this can't be turned into an open redirect via the query string.
  const rawNext = searchParams.get("next") ?? "";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const [step, setStep] = useState<Step>("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  async function finishLogin() {
    await refresh();
    // `next` is a runtime-derived, already-validated same-site path — Next's
    // typed routes can't statically know it, same as the dynamic hrefs in
    // site-header.tsx.
    router.push(next as Route);
  }

  function handleRequestOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const res = await requestOtpAction(phone, name);
      if (res.error) {
        setError(res.error);
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }
      setTestMode(Boolean(res.test_mode));
      setDebugCode(res.debug_code ?? null);
      setStep("otp");
    });
  }

  function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const res = await verifyOtpAction(phone, code, name);
      if (res.error) {
        setError(res.error);
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }
      await finishLogin();
    });
  }

  function handleSkip() {
    setError(null);
    startTransition(async () => {
      const res = await skipOtpAction(phone, name);
      if (res.error) {
        setError(res.error);
        return;
      }
      await finishLogin();
    });
  }

  function handleResend() {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const res = await requestOtpAction(phone, name);
      if (res.error) {
        setError(res.error);
        return;
      }
      setTestMode(Boolean(res.test_mode));
      setDebugCode(res.debug_code ?? null);
      setNotice("We sent a new code.");
    });
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-ink-600">
            Enter the 6-digit code sent to <span className="font-semibold text-ink-900">{phone}</span>.
          </p>
          {testMode ? (
            <div className="mt-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-brand-800">
              SMS isn&apos;t connected yet — test mode is on.
              {debugCode ? (
                <>
                  {" "}
                  Your code: <span className="font-mono font-bold">{debugCode}</span>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-ink-700">
            Verification code
          </label>
          <input
            id="code"
            inputMode="numeric"
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            className={`${inputClasses} tracking-[0.3em]`}
          />
          {fieldErrors.code ? <p className="mt-1.5 text-xs text-danger">{fieldErrors.code[0]}</p> : null}
        </div>

        {error && !fieldErrors.code ? <p className="break-words text-sm text-danger">{error}</p> : null}
        {notice ? <p className="text-sm text-success">{notice}</p> : null}

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? "Verifying…" : "Verify & continue"}
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={pending}
            className="font-semibold text-accent-600 hover:underline disabled:opacity-50"
          >
            Resend code
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setCode("");
              setError(null);
              setFieldErrors({});
            }}
            className="text-ink-500 hover:text-ink-700"
          >
            Change phone number
          </button>
        </div>

        {testMode ? (
          <button
            type="button"
            onClick={handleSkip}
            disabled={pending}
            className="rounded-xl border border-dashed border-ink-300 px-4 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:border-ink-400 hover:text-ink-900 disabled:opacity-50"
          >
            Skip verification (test mode) — continue without a code
          </button>
        ) : null}
      </form>
    );
  }

  return (
    <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink-700">
          Full name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClasses}
        />
        {fieldErrors.name ? <p className="mt-1.5 text-xs text-danger">{fieldErrors.name[0]}</p> : null}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink-700">
          Mobile number
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="98765 43210"
          className={inputClasses}
        />
        {fieldErrors.phone ? <p className="mt-1.5 text-xs text-danger">{fieldErrors.phone[0]}</p> : null}
      </div>

      {error && !fieldErrors.phone && !fieldErrors.name ? (
        <p className="break-words text-sm text-danger">{error}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Sending code…" : "Send verification code"}
      </Button>

      <p className="text-xs text-ink-500">
        We&apos;ll text a 6-digit code to confirm it&apos;s really you. Already have an account? Enter the same
        number to sign back in.
      </p>
    </form>
  );
}
