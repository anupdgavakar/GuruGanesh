import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-linear-to-br from-accent-900 via-accent-800 to-brand-800 px-4 py-12">
      <div className="w-full max-w-sm rounded-card border border-white/10 bg-white p-8 shadow-2xl">
        <Image src="/brand/logo-mark.png" alt="Guru Ganesh Graphics" width={56} height={56} className="h-14 w-14" priority unoptimized />
        <h1 className="mt-4 font-display text-xl font-semibold text-ink-900">Guru Ganesh Admin</h1>
        <p className="mt-1 text-sm text-ink-500">Sign in with your admin or staff account.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
