import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { RegisterOtpForm } from "@/components/auth/register-otp-form";

export const metadata: Metadata = {
  title: "Login / Signup",
};

export default function LoginPage() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-accent-900 via-accent-800 to-brand-900 py-20 sm:py-28">
      <div aria-hidden className="absolute -top-20 right-10 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" />
      <Container className="relative flex justify-center">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 shadow-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-brand-100">
            Sign in
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink-900">
            Welcome to Guru Ganesh Graphics
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Sign in or create an account with your mobile number — no password to remember.
          </p>

          <div className="mt-6">
            {/* useSearchParams (for ?next=) needs a Suspense boundary, or
                this otherwise-static page would be forced dynamic. */}
            <Suspense fallback={null}>
              <RegisterOtpForm />
            </Suspense>
          </div>

          <p className="mt-6 border-t border-ink-100 pt-4 text-center text-sm text-ink-500">
            Prefer not to sign in?{" "}
            <Link href="/products" className="font-semibold text-accent-600 hover:underline">
              Continue as a guest
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
