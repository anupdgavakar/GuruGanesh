export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Icon keys map to a small inline-SVG set in <Sidebar> — kept here as plain
// string tags (rather than importing JSX into this config) so this file can
// stay a simple data module.
export type NavIcon =
  | "box"
  | "grid"
  | "layers"
  | "palette"
  | "truck"
  | "tag"
  | "sliders"
  | "star"
  | "document"
  | "image"
  | "megaphone"
  | "inbox"
  | "cart";

export const navGroups: NavGroup[] = [
  {
    label: "Catalog",
    items: [
      { label: "Products", href: "/products", icon: "box" },
      { label: "Categories", href: "/categories", icon: "grid" },
      { label: "Subcategories", href: "/subcategories", icon: "layers" },
      { label: "Design modes", href: "/design-modes", icon: "palette" },
      { label: "Delivery options", href: "/delivery-options", icon: "truck" },
      { label: "Product types", href: "/product-types", icon: "tag" },
      { label: "Pricing tiers", href: "/pricing-tiers", icon: "sliders" },
      { label: "Brands", href: "/brands", icon: "star" },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog posts", href: "/blogs", icon: "document" },
      { label: "Services", href: "/services", icon: "megaphone" },
      { label: "Testimonials", href: "/testimonials", icon: "star" },
      { label: "Media library", href: "/media", icon: "image" },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Orders", href: "/orders", icon: "cart" },
      { label: "Inquiries", href: "/inquiries", icon: "inbox" },
    ],
  },
];
