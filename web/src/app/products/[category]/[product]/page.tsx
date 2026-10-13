import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartPanel } from "@/components/products/add-to-cart-panel";
import { AskPricePanel } from "@/components/products/ask-price-panel";
import { ProductGallery } from "@/components/products/product-gallery";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getProductBySlug } from "@/lib/api/resources";
import { formatPrice, isQuoteOnly, pageTitle } from "@/lib/utils";
import { COMING_SOON_IMAGE } from "@/lib/placeholders";

export const revalidate = 300;

type Params = { category: string; product: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { product: slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: pageTitle(product.meta_title || product.name),
    description: product.meta_description || product.description || undefined,
    openGraph: product.thumbnail_url ? { images: [product.thumbnail_url] } : undefined,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { category: categorySlug, product: productSlug } = await params;
  const product = await getProductBySlug(productSlug);

  if (!product) notFound();

  // Every picture this product has, main one first, without repeats.
  const pictures = Array.from(
    new Set(
      [product.header_image_url, product.thumbnail_url, ...(product.images ?? []).map((image) => image.url)].filter(
        (url): url is string => Boolean(url),
      ),
    ),
  ).slice(0, 12);

  return (
    <Container className="py-16 sm:py-24">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink-500">
        <Link href="/products" className="hover:text-brand-600">
          Catalog
        </Link>
        <span>/</span>
        <Link href={`/products/${product.category?.slug ?? categorySlug}`} className="hover:text-brand-600">
          {product.category?.name ?? categorySlug}
        </Link>
        <span>/</span>
        <span className="text-ink-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={pictures.length > 0 ? pictures : [COMING_SOON_IMAGE]} name={product.name} />

        <div>
          {product.category ? <Badge>{product.category.name}</Badge> : null}
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-brand-600">{isQuoteOnly(product.base_price) ? "Ask for price" : `From ${formatPrice(product.base_price)}`}</p>

          {product.description ? <p className="mt-4 text-ink-700">{product.description}</p> : null}

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-ink-100 pt-6 text-sm">
            <div>
              <dt className="text-ink-500">Minimum quantity</dt>
              <dd className="font-semibold text-ink-900">{product.min_quantity}</dd>
            </div>
            {product.max_quantity ? (
              <div>
                <dt className="text-ink-500">Maximum quantity</dt>
                <dd className="font-semibold text-ink-900">{product.max_quantity}</dd>
              </div>
            ) : null}
            {product.deliveryOption ? (
              <div>
                <dt className="text-ink-500">Delivery</dt>
                <dd className="font-semibold text-ink-900">{product.deliveryOption.name}</dd>
              </div>
            ) : null}
            {product.designMode ? (
              <div>
                <dt className="text-ink-500">Design</dt>
                <dd className="font-semibold text-ink-900">{product.designMode.name}</dd>
              </div>
            ) : null}
          </dl>

          {isQuoteOnly(product.base_price) ? (
            <AskPricePanel product={product} />
          ) : (
            <AddToCartPanel product={product} categorySlug={product.category?.slug ?? categorySlug} />
          )}

          <div className="mt-4">
            <ButtonLink href="/products" variant="outline" size="sm">
              Keep browsing
            </ButtonLink>
          </div>
        </div>
      </div>
    </Container>
  );
}
