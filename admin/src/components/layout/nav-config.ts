import type { Permission } from "@/lib/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
  /** Who sees this entry — left out means every team member. */
  permission?: Permission;
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
  | "cart"
  | "gear"
  | "users";

export const navGroups: NavGroup[] = [
  {
    label: "Catalog",
    items: [
      { label: "Products", href: "/products", icon: "box", permission: "catalog" },
      { label: "Categories", href: "/categories", icon: "grid", permission: "catalog" },
      { label: "Subcategories", href: "/subcategories", icon: "layers", permission: "catalog" },
      { label: "Design modes", href: "/design-modes", icon: "palette", permission: "catalog" },
      { label: "Delivery options", href: "/delivery-options", icon: "truck", permission: "catalog" },
      { label: "Product types", href: "/product-types", icon: "tag", permission: "catalog" },
      { label: "Pricing tiers", href: "/pricing-tiers", icon: "sliders", permission: "catalog" },
      { label: "Brands", href: "/brands", icon: "star", permission: "catalog" },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Homepage slides", href: "/sliders", icon: "sliders", permission: "content" },
      { label: "Blog posts", href: "/blogs", icon: "document", permission: "content" },
      { label: "Services", href: "/services", icon: "megaphone", permission: "content" },
      { label: "Testimonials", href: "/testimonials", icon: "star", permission: "content" },
      { label: "Media library", href: "/media", icon: "image", permission: "content" },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Orders", href: "/orders", icon: "cart", permission: "orders" },
      { label: "Inquiries", href: "/inquiries", icon: "inbox", permission: "inquiries" },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Team", href: "/team", icon: "users", permission: "users" },
      { label: "Site settings", href: "/settings", icon: "gear", permission: "settings" },
    ],
  },
];

/** The menu for one person: only the entries their role may open, and no empty headings. */
export function navGroupsFor(permissions: string[] | undefined): NavGroup[] {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || permissions?.includes(item.permission)),
    }))
    .filter((group) => group.items.length > 0);
}
