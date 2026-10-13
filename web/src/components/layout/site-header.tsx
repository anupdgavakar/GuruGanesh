"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { CartButton } from "@/components/cart/cart-button";
import { Container } from "@/components/ui/container";
import { useAuth } from "@/lib/auth/auth-context";
import { CategoryNav } from "./category-nav";
import { navLinks } from "./nav-links";
import type { ProductCategory } from "@/lib/api/types";

function firstName(name: string) {
  return name.split(" ")[0] || name;
}

export function SiteHeader({ categories }: { categories: ProductCategory[] }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-paper/95 backdrop-blur">
      <Container className="flex h-16 items-center gap-3 sm:h-20 sm:gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image src="/brand/logo-mark.png" alt="" width={40} height={40} className="h-9 w-9 sm:h-10 sm:w-10" priority unoptimized />
          <span className="hidden font-display text-lg font-extrabold tracking-tight sm:inline">
            <span className="text-brand-600">Guru Ganesh</span>{" "}
            <span className="text-accent-700">Graphics</span>
          </span>
        </Link>

        <form action="/search" className="relative min-w-0 flex-1">
          <input
            type="search"
            name="q"
            placeholder="Search for products…"
            aria-label="Search products"
            className="h-11 w-full rounded-full border border-ink-200 bg-white pl-4 pr-11 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-400"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-brand-600"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/help"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-brand-600 lg:flex"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9.3a2.5 2.5 0 0 1 4.9.7c0 1.7-2.4 2-2.4 3.5" />
              <path d="M12 17.2h.01" />
            </svg>
            Help Center
          </Link>

          {user ? (
            <div className="hidden items-center gap-1 md:flex">
              <span className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.5 20c1.4-3.5 4.4-5.5 7.5-5.5s6.1 2 7.5 5.5" />
                </svg>
                Hi, {firstName(user.name)}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-brand-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-brand-600 md:flex"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M4.5 20c1.4-3.5 4.4-5.5 7.5-5.5s6.1 2 7.5 5.5" />
              </svg>
              Login / Signup
            </Link>
          )}

          <CartButton />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-900 hover:bg-ink-100 md:hidden"
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </Container>

      <CategoryNav categories={categories} />

      {open ? (
        <div className="border-t border-ink-100 bg-paper md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            <Link
              href="/help"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-brand-600"
            >
              Help Center
            </Link>
            {user ? (
              <div className="flex items-center justify-between rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-ink-700">Hi, {firstName(user.name)}</span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="text-sm font-semibold text-brand-600 hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-brand-600"
              >
                Login / Signup
              </Link>
            )}

            <div className="mt-1 border-t border-ink-100 pt-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-brand-600"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {categories.length > 0 ? (
              <div className="mt-2 flex flex-col border-t border-ink-100 pt-2">
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Shop by category
                </p>
                {categories.map((category) => (
                  <details key={category.id} className="group border-b border-ink-50 last:border-0">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-medium text-ink-700 [&::-webkit-details-marker]:hidden">
                      {category.name}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="shrink-0 text-ink-400 transition-transform group-open:rotate-180"
                      >
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </summary>
                    <div className="flex flex-col gap-0.5 pb-2 pl-3">
                      <Link
                        href={`/products/${category.slug}` as Route}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-2 py-1.5 text-sm font-semibold text-brand-600 hover:bg-ink-100"
                      >
                        View all {category.name}
                      </Link>
                      {(category.subcategories ?? []).map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/products/${category.slug}?subcategory=${sub.slug}` as Route}
                          onClick={() => setOpen(false)}
                          className="rounded-md px-2 py-1.5 text-sm text-ink-600 hover:bg-ink-100 hover:text-brand-600"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            ) : null}

            <ButtonLink href="/products" className="mt-2 justify-center" onClick={() => setOpen(false)}>
              Start designing
            </ButtonLink>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
