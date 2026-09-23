import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { iconFor } from "@/lib/category-icons";
import { imageFor } from "@/lib/category-images";
import type { ProductCategory } from "@/lib/api/types";

const placeholderCategories = [
  "Business cards",
  "Flyers & brochures",
  "Packaging",
  "Signage & banners",
  "Stickers & labels",
  "Apparel",
];

export function CategoryGrid({ categories }: { categories: ProductCategory[] }) {
  const items =
    categories.length > 0
      ? categories.slice(0, 6)
      : placeholderCategories.map((name, i) => ({ id: i, name, slug: "" }));

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Shop by category"
          title="Everything you need to print"
          description="From a single business card to a full packaging run — browse the catalog by category."
        />

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((category) => {
            const photo = imageFor(category.name);

            return (
              <Link
                key={category.id}
                href={(category.slug ? `/products?category=${category.slug}` : "/products") as Route}
                className="group relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl border border-ink-100 bg-paper-muted shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {photo ? (
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-brand-500 to-accent-600 text-white"
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      {iconFor(category.name)}
                    </svg>
                  </span>
                )}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent"
                />
                <div className="relative flex flex-col gap-1 p-3">
                  <span className="text-sm font-semibold text-white drop-shadow-sm">{category.name}</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-brand-200 opacity-0 transition-opacity group-hover:opacity-100">
                    Shop now
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {categories.length === 0 ? (
          <p className="mt-6 text-center text-xs text-ink-500">
            Showing placeholder categories — connect the Laravel API and seed data to see the real catalog here.
          </p>
        ) : null}
      </Container>
    </section>
  );
}
