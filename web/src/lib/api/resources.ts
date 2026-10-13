import { apiFetch, apiFetchSafe, ApiError } from "./client";
import type {
  ApiResource,
  Blog,
  Brand,
  ContactInquiryPayload,
  PaginatedResponse,
  Product,
  ProductCategory,
  RawPaginatedResponse,
  Service,
  SiteSettings,
  Slider,
  Testimonial,
} from "./types";

// Same fallback as the API's own Setting::DESIGN_SUBMISSION_EMAIL_DEFAULT —
// keeps the checkout UI showing a real address even if GET /settings is
// briefly unreachable, rather than a blank field.
const DESIGN_SUBMISSION_EMAIL_FALLBACK = "guruganeshgraphics@gmail.com";

/**
 * One function per public catalog endpoint, matching routes/api.php on the
 * backend. Every read uses apiFetchSafe so a missing/unreachable API
 * degrades to an empty list instead of crashing the page — see client.ts.
 */

export async function getSliders() {
  // Short revalidate, same reasoning as getFeaturedProducts: this list is
  // directly admin-managed (Homepage Slides), and an edit there should show
  // up on the storefront in seconds, not the default 5 minutes.
  const res = await apiFetchSafe<PaginatedResponse<Slider>>("/api/sliders", { revalidate: 15 });
  return res?.data ?? [];
}

export async function getCategories() {
  // Short revalidate, same reasoning as getSliders/getFeaturedProducts:
  // categories/subcategories now carry admin-editable content too (the
  // subcategory thumbnail shown in the header's category dropdown), and
  // this is fetched from the root layout — every page — so the default
  // 5-minute cache made a just-uploaded image look broken for minutes
  // rather than seconds.
  const res = await apiFetchSafe<PaginatedResponse<ProductCategory>>("/api/categories", { revalidate: 15 });
  return res?.data ?? [];
}

/** A single category with its subcategories, or null if the slug doesn't exist / API is down. */
export async function getCategoryBySlug(slug: string) {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getFeaturedProducts(limit = 8) {
  // /api/products calls Eloquent's ->paginate() directly, so the array is
  // nested one level deeper than PaginatedResponse — see RawPaginatedResponse.
  //
  // Short revalidate (not the 300s default): this list is driven by the
  // admin's one-click "homepage featured" star toggle, and someone flipping
  // that star expects the storefront to catch up within seconds, not
  // minutes — the default 5-minute cache made a just-changed selection look
  // like it hadn't taken effect at all.
  const res = await apiFetchSafe<RawPaginatedResponse<Product>>(`/api/products?featured=1&per_page=${limit}`, {
    revalidate: 15,
  });
  return res?.data.data ?? [];
}

export async function getProducts(
  params: { categoryId?: number; subcategoryId?: number; perPage?: number; search?: string } = {},
) {
  const query = new URLSearchParams();
  if (params.categoryId) query.set("category_id", String(params.categoryId));
  if (params.subcategoryId) query.set("subcategory_id", String(params.subcategoryId));
  if (params.search?.trim()) query.set("search", params.search.trim());
  query.set("per_page", String(params.perPage ?? 24));

  const res = await apiFetchSafe<RawPaginatedResponse<Product>>(`/api/products?${query.toString()}`);
  return res?.data.data ?? [];
}

/** A single product by slug, or null if it doesn't exist / API is down. */
export async function getProductBySlug(slug: string) {
  try {
    const res = await apiFetch<ApiResource<Product>>(`/api/products/${slug}`);
    return res.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    return null; // API unreachable — treat the same as "not found" for page rendering
  }
}

export async function getServices() {
  // One minute: services are admin-managed (including their pictures), so an
  // upload should show soon, but shorter than this makes the Services page
  // re-ask the API on almost every visit and feel slow.
  const res = await apiFetchSafe<PaginatedResponse<Service>>("/api/services", { revalidate: 60 });
  return res?.data ?? [];
}

export async function getTestimonials(limit = 6) {
  const res = await apiFetchSafe<PaginatedResponse<Testimonial>>(`/api/testimonials?per_page=${limit}`);
  return res?.data ?? [];
}

/**
 * Short revalidate — same reasoning as getCategories/getSliders: this is
 * admin-editable (Settings page) and used in the cart, so a just-changed
 * design-submission email shouldn't look stale for a full 5 minutes.
 */
export async function getSettings(): Promise<SiteSettings> {
  const res = await apiFetchSafe<ApiResource<SiteSettings>>("/api/settings", { revalidate: 15 });
  return res?.data ?? { design_submission_email: DESIGN_SUBMISSION_EMAIL_FALLBACK };
}

export async function getBrands() {
  const res = await apiFetchSafe<PaginatedResponse<Brand>>("/api/brands");
  return res?.data ?? [];
}

export async function getBlogs(limit = 12) {
  // Same nested shape as /api/products — see RawPaginatedResponse.
  const res = await apiFetchSafe<RawPaginatedResponse<Blog>>(`/api/blogs?per_page=${limit}`, { revalidate: 30 });
  return res?.data.data ?? [];
}

export async function getLatestBlogs(limit = 3) {
  return getBlogs(limit);
}

/** A single blog post by slug, or null if it doesn't exist / API is down. */
export async function getBlogBySlug(slug: string) {
  try {
    const res = await apiFetch<ApiResource<Blog>>(`/api/blogs/${encodeURIComponent(slug)}`, { revalidate: 30 });
    return res.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    return null;
  }
}

/**
 * Submits the contact form. Unlike the read helpers above this throws on
 * failure — the contact form component needs to know whether it actually
 * worked so it can show an error instead of a false "thanks!" message.
 */
export async function submitInquiry(payload: ContactInquiryPayload) {
  return apiFetch<{ status: string; message: string }>("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    revalidate: false,
  });
}

// Order submission moved to actions/order-actions.ts#submitOrderAction —
// checkout now requires a logged-in customer, and the Bearer token lives in
// an httpOnly cookie only a Server Action can read (see that file).
