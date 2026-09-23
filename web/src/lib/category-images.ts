// Realistic category photography for the homepage grid and /products
// catalog index — curated stock photos (Unsplash/Pexels, both free for
// commercial use), keyed by keyword the same way lib/category-icons.tsx
// matches category names. These are a deliberate stand-in: swap each entry
// for real product photography (uploaded through the admin Media library)
// once it exists — nothing else in these components needs to change, since
// both read through this same lookup.
const imagesByKeyword: { match: RegExp; url: string; alt: string }[] = [
  {
    match: /card/i,
    url: "https://images.unsplash.com/photo-1623305463957-df17547327cb?auto=format&fit=crop&w=800&q=80",
    alt: "A neat stack of blank business cards",
  },
  {
    match: /flyer|brochure|leaflet/i,
    url: "https://images.unsplash.com/photo-1695634621375-0b66a9d5d1bc?auto=format&fit=crop&w=800&q=80",
    alt: "A folded brochure with a printed design",
  },
  {
    match: /packag/i,
    url: "https://images.unsplash.com/photo-1700165644892-3dd6b67b25bc?auto=format&fit=crop&w=800&q=80",
    alt: "Brown cardboard packaging boxes",
  },
  {
    match: /sign|banner/i,
    url: "https://images.pexels.com/photos/7590691/pexels-photo-7590691.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "A printed storefront sign",
  },
  {
    match: /sticker|label/i,
    url: "https://images.pexels.com/photos/16605271/pexels-photo-16605271.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "A sheet of colorful printed stickers",
  },
  {
    match: /apparel|shirt|clothing/i,
    url: "https://images.pexels.com/photos/4440574/pexels-photo-4440574.jpeg?auto=compress&cs=tinysrgb&w=800",
    alt: "A neatly folded stack of blank t-shirts",
  },
];

export function imageFor(name: string) {
  return imagesByKeyword.find((entry) => entry.match.test(name)) ?? null;
}
