/**
 * Types mirroring the Laravel API's JSON resources (guru_api, Phase 1 + 2 +
 * the Phase 4 model fixes). Keep these in sync with app/Models/* and
 * app/Http/Controllers/Api/* on the backend — there's no shared codegen
 * yet, so a field renamed on one side needs the same rename here.
 *
 * Laravel serializes `decimal:*` casts (base_price) as STRINGS, not numbers
 * — that's a deliberate Laravel choice to avoid float rounding, not a bug.
 * Use `Number(product.base_price)` (see formatPrice in lib/utils.ts) when
 * you need to do arithmetic with it.
 */

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

/**
 * Endpoints that call Eloquent's ->paginate() directly (products, blogs)
 * put Laravel's raw paginator object — itself shaped like
 * { data: T[], current_page, last_page, per_page, total, ... } — under the
 * outer envelope's `data` key. That's one level deeper than
 * PaginatedResponse above, which matches an already-flat list (e.g.
 * /api/categories, built with ->get()). Reading `res.data` directly on a
 * ->paginate() endpoint gets the paginator object, not an array — use
 * `res.data.data` for those (see resources.ts getProducts/getBlogs).
 */
export interface RawPaginatedResponse<T> {
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiResource<T> {
  data: T;
}

export interface ProductImage {
  id: number;
  path: string;
  url: string | null;
  sort_order: number;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  subcategories?: ProductSubcategory[];
}

export interface ProductSubcategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
}

export interface ProductLookup {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  /** Decimal cast — a numeric string, e.g. "499.00". See top-of-file note. */
  base_price: string;
  min_quantity: number;
  max_quantity: number | null;
  status: boolean;
  is_featured: boolean;
  category_id: number;
  subcategory_id: number | null;
  design_mode_id: number | null;
  delivery_option_id: number | null;
  product_type_id: number | null;
  pricing_tier_id: number | null;
  thumbnail_url: string | null;
  header_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  images?: ProductImage[];
  category?: ProductCategory;
  subcategory?: ProductSubcategory | null;
  designMode?: ProductLookup | null;
  deliveryOption?: ProductLookup | null;
  productType?: ProductLookup | null;
  pricingTier?: ProductLookup | null;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail_url: string | null;
  status: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  author?: { id: number; name: string } | null;
}

export interface Testimonial {
  id: number;
  customer_name: string;
  customer_company: string | null;
  rating: number;
  message: string;
  avatar_url: string | null;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  content: string | null;
  icon_url: string | null;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

export interface Slider {
  id: number;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
}

export interface ContactInquiryPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  /** Honeypot — must stay empty. Never shown to real users. */
  website?: string;
}

export interface OrderPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address?: string;
  notes?: string;
  items: { product_id: number; quantity: number }[];
  /** Honeypot — must stay empty. Never shown to real users. */
  website?: string;
}

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  product_slug: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string | null;
  notes: string | null;
  subtotal: string;
  status: string;
  items: OrderItem[];
  created_at: string;
}
