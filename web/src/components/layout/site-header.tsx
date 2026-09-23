"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { CartButton } from "@/components/cart/cart-button";
import { Container } from "@/components/ui/container";
import { CategoryNav } from "./category-nav";
import { navLinks } from "./nav-links";
import type { ProductCategory } from "@/lib/api/types";

export function SiteHeader({ categories }: { categories: ProductCategory[] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-paper/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/brand/logo-mark.png" alt="" width={40} height={40} className="h-9 w-9 sm:h-10 sm:w-10" priority unoptimized />
          <span className="font-display text-lg font-extrabold tracking-tight">
            <span className="text-brand-600">Guru Ganesh</span>{" "}
            <span className="text-accent-700">Graphics</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-700 transition-colors hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <CartButton />
          <div className="hidden md:block">
            <ButtonLink href="/products" size="sm">
              Start designing
            </ButtonLink>
          </div>

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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-brand-600"
              >
                {link.label}
              </Link>
            ))}

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
