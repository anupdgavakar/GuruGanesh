import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { iconFor } from "@/lib/category-icons";
import { COMING_SOON_IMAGE } from "@/lib/placeholders";
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
      : placeholderCategories.map((name, i): ProductCategory => ({ id: i, name, slug: "", image_url: null, meta_title: null, meta_description: null }));

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Shop by category"
          title="Everything you need to print"
          description="From a single business card to a full packaging run — browse the catalog by category."
        />

        {/* Plain 3-column grid (was 6) — same tile treatment as before, just fewer, bigger columns. */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((category) => {
            const photo = category.image_url
              ? { url: category.image_url, alt: category.name }
              : { url: COMING_SOON_IMAGE, alt: `${category.name} — coming soon` };

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
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent"
                />
                <div className="relative flex flex-col gap-1 p-5">
                  <span className="text-lg font-semibold text-white drop-shadow-sm">{category.name}</span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-brand-200 opacity-0 transition-opacity group-hover:opacity-100">
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
      </Container>
    </section>
  );
}
