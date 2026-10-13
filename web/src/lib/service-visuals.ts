/**
 * Look and feel for each service on the Services page: icon, colour,
 * which product category's picture to borrow when the service has no
 * picture of its own, and a few default highlights. The text of the
 * services themselves lives in the database (ServiceSeeder / admin); this
 * file only decides how a service is dressed up, matched by its slug.
 */

export type ServiceIconName =
  | "design" | "brand" | "bulk" | "rush" | "gift" | "heart"
  | "flag" | "display" | "package" | "stamp" | "truck" | "layout";

export interface ServiceVisual {
  icon: ServiceIconName;
  /** Slug of the product category whose picture is used when the service has none. */
  categorySlug: string | null;
  highlights: string[];
}

export const SERVICE_VISUALS: Record<string, ServiceVisual> = {
  "design-assistance": {
    icon: "design",
    categorySlug: "design-and-creative-services",
    highlights: ["Artwork checked and made print-ready", "New designs from your idea or reference", "Help from our designers"],
  },
  "logo-and-brand-identity-design": {
    icon: "brand",
    categorySlug: "corporate-branding-materials",
    highlights: ["Logo design", "Colours and styles that match", "One look across cards, stationery and signage"],
  },
  "bulk-and-corporate-orders": {
    icon: "bulk",
    categorySlug: "business-stationery",
    highlights: ["Larger and repeat orders", "One point of contact", "For offices and businesses"],
  },
  "rush-urgent-printing": {
    icon: "rush",
    categorySlug: "flyers-brochures-marketing",
    highlights: ["Priority production", "For time-sensitive jobs", "Tell us your deadline"],
  },
  "custom-and-personalised-printing": {
    icon: "gift",
    categorySlug: "photo-gifts-and-personalised-gifts",
    highlights: ["One-off and small runs", "Gifts and photo items", "Caps and promotional wear"],
  },
  "wedding-and-event-printing": {
    icon: "heart",
    categorySlug: "wedding-and-event-printing",
    highlights: ["Invitations and cards", "Backdrops and banners", "Welcome boards"],
  },
  "election-and-political-campaign-printing": {
    icon: "flag",
    categorySlug: "election-and-political-campaign-materials",
    highlights: ["Banners and flags", "Stickers and stage backdrops", "Direction boards and handouts"],
  },
  "signage-banners-and-display-printing": {
    icon: "display",
    categorySlug: "posters-banners-display",
    highlights: ["Shop boards and flex banners", "Standees and posters", "Vehicle branding"],
  },
  "packaging-and-labels": {
    icon: "package",
    categorySlug: "packaging-bags",
    highlights: ["Boxes and bags", "Tags and product labels", "For retail and food businesses"],
  },
  "rubber-stamps-and-seals": {
    icon: "stamp",
    categorySlug: "rubber-stamps-seals",
    highlights: ["Company stamps and seals", "Signature stamps", "Made to your text and size"],
  },
  "delivery-and-shipping": {
    icon: "truck",
    categorySlug: null,
    highlights: ["Delivery to your door", "Ask about your location", "Order status by call or email"],
  },
  "free-templates-and-proofing": {
    icon: "layout",
    categorySlug: "visiting-cards",
    highlights: ["Ready-made templates", "A design proof for your approval", "Approve before we print"],
  },
};

/** Shown until the services have been added to the database. */
export const FALLBACK_SERVICES: { slug: string; name: string; short_description: string }[] = [
  { slug: "design-assistance", name: "Design assistance", short_description: "Our designers get your artwork print-ready, or create a new look from your idea." },
  { slug: "logo-and-brand-identity-design", name: "Logo and brand identity design", short_description: "Logo, colours and a basic brand kit that carries across your cards, stationery and signage." },
  { slug: "bulk-and-corporate-orders", name: "Bulk and corporate orders", short_description: "Volume printing and one point of contact for offices and businesses placing larger or repeat orders." },
  { slug: "rush-urgent-printing", name: "Rush / urgent printing", short_description: "Priority production for time-sensitive jobs." },
  { slug: "custom-and-personalised-printing", name: "Custom and personalised printing", short_description: "One-off and small-run jobs: gifts, photo items, caps and promotional wear." },
  { slug: "wedding-and-event-printing", name: "Wedding and event printing", short_description: "Invitations, cards, backdrops, banners and welcome boards for weddings and functions." },
  { slug: "election-and-political-campaign-printing", name: "Election and political campaign printing", short_description: "Banners, flags, stickers, stage backdrops, direction boards and handouts for campaigns." },
  { slug: "signage-banners-and-display-printing", name: "Signage, banners and display printing", short_description: "Shop boards, flex banners, standees, posters and vehicle branding." },
  { slug: "packaging-and-labels", name: "Packaging and labels", short_description: "Boxes, bags, tags and product labels for retail and food businesses." },
  { slug: "rubber-stamps-and-seals", name: "Rubber stamps and seals", short_description: "Custom stamps, seals and signature stamps." },
  { slug: "delivery-and-shipping", name: "Delivery and shipping", short_description: "Delivery of finished orders to your door." },
  { slug: "free-templates-and-proofing", name: "Free templates and proofing", short_description: "Ready-made templates and a design proof for your approval before printing." },
];

/** Colour themes, handed out in turn. Full class names so Tailwind can see them. */
export const SERVICE_TONES = [
  { bar: "from-orange-500 to-amber-400", chip: "bg-orange-500", soft: "bg-orange-50", text: "text-orange-700", ring: "ring-orange-200", dot: "bg-orange-500" },
  { bar: "from-rose-500 to-pink-400", chip: "bg-rose-500", soft: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", dot: "bg-rose-500" },
  { bar: "from-sky-500 to-cyan-400", chip: "bg-sky-500", soft: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-200", dot: "bg-sky-500" },
  { bar: "from-emerald-500 to-lime-400", chip: "bg-emerald-500", soft: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  { bar: "from-violet-500 to-fuchsia-400", chip: "bg-violet-500", soft: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-200", dot: "bg-violet-500" },
  { bar: "from-amber-500 to-yellow-300", chip: "bg-amber-500", soft: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", dot: "bg-amber-500" },
  { bar: "from-teal-500 to-emerald-400", chip: "bg-teal-500", soft: "bg-teal-50", text: "text-teal-700", ring: "ring-teal-200", dot: "bg-teal-500" },
  { bar: "from-fuchsia-500 to-purple-400", chip: "bg-fuchsia-500", soft: "bg-fuchsia-50", text: "text-fuchsia-700", ring: "ring-fuchsia-200", dot: "bg-fuchsia-500" },
] as const;

export const DEFAULT_VISUAL: ServiceVisual = { icon: "design", categorySlug: null, highlights: [] };
