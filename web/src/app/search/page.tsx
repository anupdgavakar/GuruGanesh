import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/sections/product-card";
import { getProducts } from "@/lib/api/resources";

export const metadata: Metadata = {
  title: "Search products",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const products = query ? await getProducts({ search: query, perPage: 48 }) : [];

  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-br from-accent-900 via-accent-800 to-brand-900 py-14 sm:py-16">
        <div aria-hidden className="absolute -top-20 right-10 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" />
        <Container className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-200 ring-1 ring-white/15">
            Search
          </span>
          <h1 className="mt-4 max-w-xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {query ? (
              <>
                Results for &ldquo;{query}&rdquo;
              </>
            ) : (
              "What are you looking for?"
            )}
          </h1>
          {query ? (
            <p className="mt-3 text-accent-100/90">
              {products.length} product{products.length === 1 ? "" : "s"} found.
            </p>
          ) : (
            <p className="mt-3 max-w-lg text-accent-100/90">
              Use the search bar at the top of the page to find a product by name.
            </p>
          )}
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        {!query ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-ink-200 py-16 text-center">
            <p className="text-ink-500">Try searching for something like &ldquo;business cards&rdquo; or &ldquo;banner&rdquo;.</p>
            <ButtonLink href="/products">Browse all products instead</ButtonLink>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-ink-200 py-16 text-center">
            <p className="text-ink-500">
              No products matched &ldquo;{query}&rdquo;. Try a different word, or browse the full catalog.
            </p>
            <ButtonLink href="/products">Browse all products</ButtonLink>
          </div>
        )}
      </Container>
    </>
  );
}
