/**
 * Types mirroring the Laravel API's JSON resources (guru_api). Kept in sync
 * with app/Models/* / app/Http/Controllers/Api/* by hand — see the same note
 * in web/src/lib/api/types.ts. This admin variant always includes `id` and
 * timestamp fields since, unlike the public site, every admin screen needs
 * them for editing and sorting.
 *
 * Laravel serializes `decimal:*` casts as STRINGS (base_price,
 * price_multiplier), not numbers — see formatPrice in lib/utils.ts.
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

export interface ApiResource<T> {
  data: T;
}

export interface ApiListResponse<T> {
  status: string;
  data: T[];
}

export interface ApiPaginatedListResponse<T> {
  status: string;
  data: PaginatedResponse<T>;
}

export type UserRole = "admin" | "staff" | "customer";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
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
  category?: ProductCategory;
}

export interface ProductDesignMode {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface ProductDeliveryOption {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  estimated_days: number | null;
}

export interface ProductType {
  id: number;
  name: string;
  slug: string;
}

export interface ProductPricingTier {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  /** Decimal cast — numeric string, e.g. "1.25". */
  price_multiplier: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
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
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  status: boolean;
}

export interface Blog {
  id: number;
  author_id: number;
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
  avatar_url: string | null;
  rating: number;
  message: string;
  status: boolean;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  content: string | null;
  icon_url: string | null;
  image_url: string | null;
  status: boolean;
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
  status: boolean;
}

export type MediaType = "image" | "video" | "document";

export interface Media {
  id: number;
  title: string;
  type: MediaType;
  path: string;
  url: string | null;
  created_at: string;
}

export type InquiryStatus = "new" | "read" | "responded";

export interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: InquiryStatus;
  created_at: string;
}

export type OrderStatus = "pending_review" | "confirmed" | "processing" | "completed" | "cancelled";

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
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
}
