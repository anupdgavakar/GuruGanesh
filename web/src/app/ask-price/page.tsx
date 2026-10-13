import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PriceRequestForm } from "@/components/products/price-request-form";
import { Container } from "@/components/ui/container";
import { getProductBySlug } from "@/lib/api/resources";

export const metadata: Metadata = {
  title: "Ask for price",
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function AskPricePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const slug = first(query.product).slice(0, 200);
  const product = slug ? await getProductBySlug(slug) : null;

  if (!product) notFound();

  const requested = Number.parseInt(first(query.qty), 10);
  const quantity = Number.isFinite(requested) && requested >= product.min_quantity ? requested : product.min_quantity;

  return (
    <Container className="py-12 sm:py-16">
      <PriceRequestForm
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          minQuantity: product.min_quantity,
          maxQuantity: product.max_quantity,
          imageUrl: product.thumbnail_url ?? product.header_image_url ?? null,
          categoryName: product.category?.name ?? null,
        }}
        initialQuantity={quantity}
      />
    </Container>
  );
}
