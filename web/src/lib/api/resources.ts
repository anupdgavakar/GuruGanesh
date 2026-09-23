import { apiFetch, apiFetchSafe, ApiError } from "./client";
import type {
  ApiResource,
  Blog,
  Brand,
  ContactInquiryPayload,
  Order,
  OrderPayload,
  PaginatedResponse,
  Product,
  ProductCategory,
  RawPaginatedResponse,
  Service,
  Slider,
  Testimonial,
} from "./types";

/**
 * One function per public catalog endpoint, matching routes/api.php on the
 * backend. Every read uses apiFetchSafe so a missing/unreachable API
 * degrades to an empty list instead of crashing the page — see client.ts.
 */

export async function getSliders() {
  const res = await apiFetchSafe<PaginatedResponse<Slider>>("/api/sliders");
  return res?.data ?? [];
}

export async function getCategories() {
  const res = await apiFetchSafe<PaginatedResponse<ProductCategory>>("/api/categories");
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

export async function getProducts(params: { categoryId?: number; subcategoryId?: number; perPage?: number } = {}) {
  const query = new URLSearchParams();
  if (params.categoryId) query.set("category_id", String(params.categoryId));
  if (params.subcategoryId) query.set("subcategory_id", String(params.subcategoryId));
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
  const res = await apiFetchSafe<PaginatedResponse<Service>>("/api/services");
  return res?.data ?? [];
}

export async function getTestimonials(limit = 6) {
  const res = await apiFetchSafe<PaginatedResponse<Testimonial>>(`/api/testimonials?per_page=${limit}`);
  return res?.data ?? [];
}

export async function getBrands() {
  const res = await apiFetchSafe<PaginatedResponse<Brand>>("/api/brands");
  return res?.data ?? [];
}

export async function getBlogs(limit = 12) {
  // Same nested shape as /api/products — see RawPaginatedResponse.
  const res = await apiFetchSafe<RawPaginatedResponse<Blog>>(`/api/blogs?per_page=${limit}`);
  return res?.data.data ?? [];
}

export async function getLatestBlogs(limit = 3) {
  return getBlogs(limit);
}

/** A single blog post by slug, or null if it doesn't exist / API is down. */
export async function getBlogBySlug(slug: string) {
  try {
    const res = await apiFetch<ApiResource<Blog>>(`/api/blogs/${slug}`);
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

/**
 * Submits a cart as an order. Like submitInquiry, this throws on failure —
 * the checkout form needs to distinguish a validation error (e.g. a
 * quantity below a product's minimum) from a real failure. Pricing itself
 * is never sent — OrderController recomputes every total from the
 * product's own base_price server-side.
 */
export async function submitOrder(payload: OrderPayload) {
  return apiFetch<{ status: string; message: string; data: Order }>("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    revalidate: false,
  });
}
