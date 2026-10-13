"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { submitInquiry } from "@/lib/api/resources";

type Status = "idle" | "submitting" | "success" | "error";

const inputClasses =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

export function ContactForm({
  defaultSubject,
  defaultMessage,
  priceRequest = false,
}: {
  defaultSubject?: string;
  defaultMessage?: string;
  /** A price request needs a phone number so we can call back with the price. */
  priceRequest?: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      await submitInquiry({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? "") || undefined,
        subject: String(form.get("subject") ?? "") || undefined,
        message: String(form.get("message") ?? ""),
        website: String(form.get("website") ?? ""), // honeypot — stays empty for real users
      });
      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof ApiError
          ? "We couldn't send that — double-check the form and try again."
          : "We couldn't reach the server. Please try again in a moment.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <p className="font-display text-lg font-bold text-ink-900">{priceRequest ? "Thanks — we've got your request!" : "Thanks — message sent!"}</p>
        <p className="mt-2 text-sm text-ink-700">{priceRequest ? "We'll call or email you with the price shortly." : "We'll get back to you shortly."}</p>
        <Button variant="outline" className="mt-4" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink-700">
            Name
          </label>
          <input id="name" name="name" type="text" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700">
            Email
          </label>
          <input id="email" name="email" type="email" required className={inputClasses} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink-700">
            Phone {priceRequest ? null : <span className="text-ink-400">(optional)</span>}
          </label>
          <input id="phone" name="phone" type="tel" required={priceRequest} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-ink-700">
            Subject <span className="text-ink-400">(optional)</span>
          </label>
          <input id="subject" name="subject" type="text" defaultValue={defaultSubject} className={inputClasses} />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink-700">
          Message
        </label>
        <textarea id="message" name="message" required rows={5} defaultValue={defaultMessage} className={inputClasses} />
      </div>

      {/* Honeypot — hidden from sighted users, off the tab order; bots that fill every field trip it. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full sm:w-auto">
        {status === "submitting" ? "Sending…" : priceRequest ? "Send price request" : "Send message"}
      </Button>
    </form>
  );
}
