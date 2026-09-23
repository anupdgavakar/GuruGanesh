import { CategoryGrid } from "@/components/sections/category-grid";
import { CtaBanner } from "@/components/sections/cta-banner";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Testimonials } from "@/components/sections/testimonials";
import { getCategories, getFeaturedProducts, getTestimonials } from "@/lib/api/resources";
import { evenCapped } from "@/lib/utils";

export const revalidate = 300;

export default async function HomePage() {
  const [categories, rawFeaturedProducts, testimonials] = await Promise.all([
    getCategories(),
    // Fetch a few extra so evenCapped still lands on 4 even if one of the
    // most-recently-featured products is missing an image (Hero filters
    // those out); trimmed to at most 4, and down to the nearest even number
    // (2 or 4, never 1 or 3) so both the hero slider and the product row
    // below it always show a balanced set.
    getFeaturedProducts(6),
    getTestimonials(),
  ]);
  const featuredProducts = evenCapped(rawFeaturedProducts, 4);

  return (
    <>
      <Hero products={featuredProducts} />
      <FeaturedProducts products={featuredProducts} />
      <CategoryGrid categories={categories} />
      <HowItWorks />
      <Testimonials testimonials={testimonials} />
      <CtaBanner />
    </>
  );
}
