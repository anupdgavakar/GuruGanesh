import Image from "next/image";
import type { Route } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Product } from "@/lib/api/types";
import { formatPrice, isQuoteOnly } from "@/lib/utils";

/**
 * Homepage "Featured products" section — admin marks up to 4 trending
 * products as "homepage featured" (the star toggle on the products list;
 * see hero.tsx for the matching slider), and each becomes one of these
 * large promotional banner cards, 2-up per row (0, 2, or 4 total — see
 * evenCapped in page.tsx, which caps and passes the same array to Hero).
 *
 * Headline/subtext/image come from the product's own "Homepage banner …"
 * fields when admin has filled them in, so a freshly-featured product
 * without banner copy still renders something reasonable instead of a
 * blank card.
 */
export function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-paper-muted py-16 sm:py-24">
      <div aria-hidden className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-200/30 blur-3xl" />
      <Container className="relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Popular right now" title="Featured products" />
          <ButtonLink href="/products" variant="outline">
            View all products
          </ButtonLink>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {products.map((product) => (
            <BannerCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function bannerImage(product: Product): string | null {
  return product.banner_image_url ?? product.header_image_url ?? product.thumbnail_url ?? product.images?.[0]?.url ?? null;
}

function productHref(product: Product): Route {
  const categorySlug = product.category?.slug ?? "products";
  return `/products/${categorySlug}/${product.slug}` as Route;
}

function BannerCard({ product }: { product: Product }) {
  const image = bannerImage(product);
  const headline = product.banner_headline?.trim() || product.name;
  const subtext =
    product.banner_subtext?.trim() ||
    (isQuoteOnly(product.base_price)
      ? "Ask for the price — designed online, delivered to your door."
      : `Starting at ${formatPrice(product.base_price)} — designed online, delivered to your door.`);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100 sm:flex-row">
      <div className="flex flex-1 flex-col justify-center gap-3 px-7 py-8 sm:px-9">
        <h3 className="text-xl font-bold leading-tight text-ink-900 sm:text-2xl">{headline}</h3>
        <p className="text-sm text-ink-500 sm:text-base">{subtext}</p>
        <ButtonLink href={productHref(product)} className="mt-2 w-fit">
          Create Your Design
        </ButtonLink>
      </div>
      <div className="relative h-48 sm:h-auto sm:w-[46%]">
        {image ? (
          <Image src={image} alt="" fill sizes="(min-width: 640px) 46vw, 100vw" className="object-cover" />
        ) : (
          <div aria-hidden className="h-full w-full bg-ink-100" />
        )}
      </div>
    </div>
  );
}
