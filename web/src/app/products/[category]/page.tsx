import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/sections/product-card";
import { Container } from "@/components/ui/container";
import { iconFor } from "@/lib/category-icons";
import { getCategoryBySlug, getProducts } from "@/lib/api/resources";

export const revalidate = 300;

type Params = { category: string };
type SearchParams = { subcategory?: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.meta_title || category.name,
    description: category.meta_description || `Browse ${category.name} at GuruGanesh Graphics.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { category: slug } = await params;
  const { subcategory: subcategorySlug } = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const activeSubcategory = subcategorySlug
    ? (category.subcategories ?? []).find((sub) => sub.slug === subcategorySlug) ?? null
    : null;

  const products = await getProducts({
    categoryId: category.id,
    subcategoryId: activeSubcategory?.id,
    perPage: 48,
  });

  return (
    <Container className="py-16 sm:py-24">
      <nav className="mb-6 text-sm text-ink-500">
        <Link href="/products" className="hover:text-brand-600">
          Catalog
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-900">{category.name}</span>
      </nav>

      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-accent-600 text-white shadow-md">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {iconFor(category.name)}
          </svg>
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{category.name}</h1>
          {category.meta_description ? <p className="mt-1 text-ink-500">{category.meta_description}</p> : null}
        </div>
      </div>

      {category.subcategories && category.subcategories.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/products/${category.slug}` as Route}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition-colors ${
              activeSubcategory
                ? "border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-600"
                : "border-brand-500 bg-brand-500 text-white"
            }`}
          >
            All
          </Link>
          {category.subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/products/${category.slug}?subcategory=${sub.slug}` as Route}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition-colors ${
                activeSubcategory?.id === sub.id
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-600"
              }`}
            >
              {sub.name}
            </Link>
          ))}
        </div>
      ) : null}

      {products.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-ink-200 py-16 text-center text-ink-500">
          No products in this category yet.
        </p>
      )}
    </Container>
  );
}
