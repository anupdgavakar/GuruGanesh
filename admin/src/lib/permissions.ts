

/**
 * What each part of the admin panel needs. The Laravel API enforces the same
 * permissions on every request (App\Enums\UserRole) — this file only decides
 * what the menu shows and which pages open, so nobody lands on a screen that
 * would just fail.
 */
export type Permission =
  | "catalog"
  | "content"
  | "orders"
  | "inquiries"
  | "design_files"
  | "settings"
  | "users"
  | "assign"
  | "delete_records";

/** First matching prefix wins. "/" (the dashboard) is open to every team member. */
const routePermissions: { prefix: string; permission: Permission }[] = [
  { prefix: "/products", permission: "catalog" },
  { prefix: "/categories", permission: "catalog" },
  { prefix: "/subcategories", permission: "catalog" },
  { prefix: "/design-modes", permission: "catalog" },
  { prefix: "/delivery-options", permission: "catalog" },
  { prefix: "/product-types", permission: "catalog" },
  { prefix: "/pricing-tiers", permission: "catalog" },
  { prefix: "/brands", permission: "catalog" },
  { prefix: "/sliders", permission: "content" },
  { prefix: "/blogs", permission: "content" },
  { prefix: "/services", permission: "content" },
  { prefix: "/testimonials", permission: "content" },
  { prefix: "/media", permission: "content" },
  { prefix: "/orders", permission: "orders" },
  { prefix: "/inquiries", permission: "inquiries" },
  { prefix: "/settings", permission: "settings" },
  { prefix: "/team", permission: "users" },
];

export function permissionForPath(pathname: string): Permission | null {
  const hit = routePermissions.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return hit?.permission ?? null;
}

export function hasPermission(user: { permissions?: string[] } | null | undefined, permission: Permission): boolean {
  return Boolean(user?.permissions?.includes(permission));
}

/** What can be ticked on a role. "users" (managing the team) is deliberately missing: only Admin has it. */
export const permissionOptions: { value: Permission; label: string; hint: string }[] = [
  { value: "catalog", label: "Catalog", hint: "Products, categories, brands and the other product lists." },
  { value: "content", label: "Website content", hint: "Homepage slides, blog posts, services, testimonials, media library." },
  { value: "orders", label: "Orders", hint: "See orders, change their status, add notes." },
  { value: "inquiries", label: "Inquiries & price requests", hint: "See the real prices and reply to customers." },
  { value: "design_files", label: "Customers' design files", hint: "Download the artwork customers send with their orders." },
  { value: "settings", label: "Site settings", hint: "Includes hiding prices on the website." },
  { value: "assign", label: "Hand work to others", hint: "Choose who handles an inquiry or order." },
  { value: "delete_records", label: "Delete orders and inquiries", hint: "Removes them for good." },
];

/** Plain-words summary of a role, used when no description was written. */
export function describePermissions(permissions: string[]): string {
  const names = permissionOptions.filter((o) => permissions.includes(o.value)).map((o) => o.label.toLowerCase());
  if (permissions.includes("users")) return "Everything, including the Team page.";
  if (names.length === 0) return "Cannot open any section.";
  return `Can use: ${names.join(", ")}.`;
}
