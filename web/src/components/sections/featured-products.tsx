import { ProductCard } from "@/components/sections/product-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Product } from "@/lib/api/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-paper-muted py-16 sm:py-24">
      <div
        aria-hidden
        className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-200/30 blur-3xl"
      />
      <Container className="relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Popular right now" title="Featured products" />
          <ButtonLink href="/products" variant="outline">
            View all products
          </ButtonLink>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
