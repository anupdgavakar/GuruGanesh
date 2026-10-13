import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { iconFor } from "@/lib/category-icons";
import { COMING_SOON_IMAGE } from "@/lib/placeholders";
import { getCategories } from "@/lib/api/resources";

export const metadata: Metadata = {
  title: "Shop by category",
  description: "Browse the full GuruGanesh Graphics catalog by category.",
};

export const revalidate = 300;

export default async function ProductsPage() {
  const categories = await getCategories();

  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-br from-accent-900 via-accent-800 to-brand-900 py-16 sm:py-20">
        <div aria-hidden className="absolute -top-20 right-10 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" />
        <Container className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-200 ring-1 ring-white/15">
            Catalog
          </span>
          <h1 className="mt-4 max-w-xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Shop by category
          </h1>
          <p className="mt-3 max-w-lg text-accent-100/90">
            Every product we print, organized by category. Pick one to see what&apos;s inside, or add straight
            to your cart from any product page.
          </p>
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const photo = category.image_url
                ? { url: category.image_url, alt: category.name }
                : { url: COMING_SOON_IMAGE, alt: `${category.name} — coming soon` };

              return (
                <Link
                  key={category.id}
                  href={`/products/${category.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-paper-muted">
                    {photo ? (
                      <Image
                        src={photo.url}
                        alt={photo.alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <span
                        aria-hidden
                        className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-brand-500 to-accent-600 text-white"
                      >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                          {iconFor(category.name)}
                        </svg>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 p-5">
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-semibold text-ink-900">{category.name}</p>
                      {category.subcategories && category.subcategories.length > 0 ? (
                        <p className="mt-1 truncate text-sm text-ink-500">
                          {category.subcategories
                            .slice(0, 3)
                            .map((s) => s.name)
                            .join(", ")}
                          {category.subcategories.length > 3 ? "…" : ""}
                        </p>
                      ) : null}
                    </div>
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-400 transition-colors group-hover:bg-brand-500 group-hover:text-white"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-ink-200 py-16 text-center">
            <p className="text-ink-500">
              No categories yet — start the Laravel API and seed data to populate the catalog here.
            </p>
            <ButtonLink href="/">Back to home</ButtonLink>
          </div>
        )}
      </Container>
    </>
  );
}
