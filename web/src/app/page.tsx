import { CategoryGrid } from "@/components/sections/category-grid";
import { CtaBanner } from "@/components/sections/cta-banner";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Testimonials } from "@/components/sections/testimonials";
import { TrustStrip } from "@/components/sections/trust-strip";
import { getCategories, getFeaturedProducts, getSliders, getTestimonials } from "@/lib/api/resources";
import { evenCapped } from "@/lib/utils";

export const revalidate = 300;

export default async function HomePage() {
  const [categories, slides, rawFeaturedProducts, testimonials] = await Promise.all([
    getCategories(),
    // The hero slider is its own admin-managed list (Homepage Slides) —
    // independent of products, since a slide can be a product, a category
    // promo, or general company info. See hero.tsx.
    getSliders(),
    // Fetch a few extra so evenCapped still lands on 4 even if one of the
    // most-recently-featured products is missing an image (FeaturedProducts
    // needs a real photo per card); trimmed to at most 4, and down to the
    // nearest even number (2 or 4, never 1 or 3) so the promo card row below
    // the hero always shows a balanced set.
    getFeaturedProducts(6),
    getTestimonials(),
  ]);
  const featuredProducts = evenCapped(rawFeaturedProducts, 4);

  return (
    <>
      <Hero slides={slides} />
      <FeaturedProducts products={featuredProducts} />
      <HowItWorks />
      <CategoryGrid categories={categories} />
      <TrustStrip />
      <Testimonials testimonials={testimonials} />
      <CtaBanner />
    </>
  );
}
