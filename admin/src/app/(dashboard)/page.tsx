import Link from "next/link";
import type { Route } from "next";
import { adminApiFetch } from "@/lib/api/client";
import type {
  ApiListResponse,
  ApiPaginatedListResponse,
  Blog,
  Brand,
  ContactInquiry,
  Order,
  Product,
  ProductCategory,
  Service,
  Testimonial,
} from "@/lib/api/types";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { InquiryStatusBadge } from "@/components/inquiries/inquiry-status-badge";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

async function safeCount(promise: Promise<{ meta?: { total: number } } | unknown[]>) {
  try {
    const res = await promise;
    if (Array.isArray(res)) return res.length;
    return res.meta?.total ?? 0;
  } catch {
    return null;
  }
}

async function safeList<T>(promise: Promise<T[]>): Promise<T[]> {
  try {
    return await promise;
  } catch {
    return [];
  }
}

const icons = {
  box: (
    <>
      <path d="M3 8l9-5 9 5-9 5-9-5z" />
      <path d="M3 8v9l9 5 9-5V8" />
      <path d="M12 13v9" />
    </>
  ),
  inbox: (
    <>
      <path d="M3 12h5l1.5 3h5L16 12h5" />
      <path d="M3 12l1.5-7h15L21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z" />
    </>
  ),
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  cart: (
    <>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3h2.5l2.5 12.5h10.5l2-9H6.5" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  document: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4" />
      <path d="M9 12h6M9 16h6" />
    </>
  ),
  megaphone: (
    <>
      <path d="M3 10v4a1 1 0 001 1h2l6 4V5l-6 4H4a1 1 0 00-1 1z" />
      <path d="M17 9a4 4 0 010 6" />
    </>
  ),
} as const;

type IconKey = keyof typeof icons;

function StatIcon({ icon, tone }: { icon: IconKey; tone: string }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${tone} text-white shadow-sm`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {icons[icon]}
      </svg>
    </span>
  );
}

function StatCard({
  label,
  value,
  href,
  icon,
  tone,
}: {
  label: string;
  value: number | null;
  href: string;
  icon: IconKey;
  tone: string;
}) {
  return (
    <Link
      href={href as Route}
      className="group flex items-center gap-3.5 rounded-card border border-ink-200 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
    >
      <StatIcon icon={icon} tone={tone} />
      <div className="min-w-0">
        <p className="truncate text-sm text-ink-500">{label}</p>
        <p className="mt-0.5 font-display text-xl font-semibold text-ink-900">
          {value === null ? "—" : value}
        </p>
      </div>
    </Link>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
      {subtitle && <span className="text-xs text-ink-500">{subtitle}</span>}
    </div>
  );
}

export default async function DashboardHomePage() {
  const [
    products,
    activeProducts,
    categories,
    subcategories,
    brands,
    pendingOrders,
    totalOrders,
    newInquiries,
    blogs,
    services,
    testimonials,
    recentOrders,
    recentInquiries,
  ] = await Promise.all([
    safeCount(
      adminApiFetch<ApiPaginatedListResponse<Product>>("/api/products?include_inactive=1&per_page=1").then(
        (r) => r.data,
      ),
    ),
    safeCount(adminApiFetch<ApiPaginatedListResponse<Product>>("/api/products?per_page=1").then((r) => r.data)),
    safeCount(adminApiFetch<ApiListResponse<ProductCategory>>("/api/categories").then((r) => r.data)),
    safeCount(
      adminApiFetch<ApiListResponse<ProductCategory>>("/api/product-subcategories").then((r) => r.data),
    ),
    safeCount(adminApiFetch<ApiListResponse<Brand>>("/api/brands?include_inactive=1").then((r) => r.data)),
    safeCount(
      adminApiFetch<ApiPaginatedListResponse<Order>>("/api/orders?status=pending_review&per_page=1").then(
        (r) => r.data,
      ),
    ),
    safeCount(adminApiFetch<ApiPaginatedListResponse<Order>>("/api/orders?per_page=1").then((r) => r.data)),
    safeCount(
      adminApiFetch<ApiPaginatedListResponse<ContactInquiry>>("/api/inquiries?status=new&per_page=1").then(
        (r) => r.data,
      ),
    ),
    safeCount(
      adminApiFetch<ApiPaginatedListResponse<Blog>>("/api/blogs?include_drafts=1&per_page=1").then((r) => r.data),
    ),
    safeCount(adminApiFetch<ApiListResponse<Service>>("/api/services?include_inactive=1").then((r) => r.data)),
    safeCount(
      adminApiFetch<ApiListResponse<Testimonial>>("/api/testimonials?include_inactive=1").then((r) => r.data),
    ),
    safeList(
      adminApiFetch<ApiPaginatedListResponse<Order>>("/api/orders?per_page=5").then((r) => r.data.data),
    ),
    safeList(
      adminApiFetch<ApiPaginatedListResponse<ContactInquiry>>("/api/inquiries?per_page=5").then(
        (r) => r.data.data,
      ),
    ),
  ]);

  const catalogStats: { label: string; value: number | null; href: string; icon: IconKey; tone: string }[] = [
    { label: "Products", value: products, href: "/products", icon: "box", tone: "from-brand-500 to-brand-600" },
    { label: "Active products", value: activeProducts, href: "/products", icon: "box", tone: "from-brand-400 to-brand-500" },
    { label: "Categories", value: categories, href: "/categories", icon: "grid", tone: "from-accent-500 to-accent-700" },
    { label: "Subcategories", value: subcategories, href: "/subcategories", icon: "layers", tone: "from-accent-600 to-accent-800" },
    { label: "Brands", value: brands, href: "/brands", icon: "star", tone: "from-ink-700 to-ink-900" },
  ];

  const customerStats: { label: string; value: number | null; href: string; icon: IconKey; tone: string }[] = [
    { label: "Total orders", value: totalOrders, href: "/orders", icon: "cart", tone: "from-brand-600 to-accent-700" },
    { label: "Orders to review", value: pendingOrders, href: "/orders?status=pending_review", icon: "cart", tone: "from-warning to-brand-600" },
    { label: "New inquiries", value: newInquiries, href: "/inquiries?status=new", icon: "inbox", tone: "from-accent-500 to-accent-700" },
  ];

  const contentStats: { label: string; value: number | null; href: string; icon: IconKey; tone: string }[] = [
    { label: "Blog posts", value: blogs, href: "/blogs", icon: "document", tone: "from-ink-600 to-ink-800" },
    { label: "Services", value: services, href: "/services", icon: "megaphone", tone: "from-brand-500 to-accent-600" },
    { label: "Testimonials", value: testimonials, href: "/testimonials", icon: "star", tone: "from-accent-400 to-accent-600" },
  ];

  const quickActions: { label: string; href: string }[] = [
    { label: "Review orders", href: "/orders" },
    { label: "Add a product", href: "/products/new" },
    { label: "Review inquiries", href: "/inquiries" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-accent-900 via-accent-800 to-brand-800 px-6 py-8 sm:px-8">
        <div aria-hidden className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative">
          <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">Welcome back</h1>
          <p className="mt-1.5 max-w-xl text-sm text-white/70">
            A quick look at the catalog and inbox — use the sidebar to manage every part of the storefront.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href as Route}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                {action.label}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionHeading title="Catalog" subtitle="Products, categories and brands" />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {catalogStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <div>
        <SectionHeading title="Customers" subtitle="Orders and contact inquiries" />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {customerStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <div>
        <SectionHeading title="Content" subtitle="What's shown on the public site" />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {contentStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-card border border-ink-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-base font-semibold text-ink-900">Recent orders</h2>
            <Link href="/orders" className="text-sm font-semibold text-accent-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-ink-100">
            {recentOrders.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-ink-500">No orders yet.</p>
            )}
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-ink-50/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">
                    #{order.id} · {order.customer_name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold text-ink-900">{formatPrice(order.subtotal)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-ink-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-base font-semibold text-ink-900">Recent inquiries</h2>
            <Link href="/inquiries" className="text-sm font-semibold text-accent-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-ink-100">
            {recentInquiries.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-ink-500">No inquiries yet.</p>
            )}
            {recentInquiries.map((inquiry) => (
              <Link
                key={inquiry.id}
                href={`/inquiries/${inquiry.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-ink-50/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">{inquiry.name}</p>
                  <p className="mt-0.5 truncate text-xs text-ink-500">
                    {inquiry.subject ?? inquiry.message}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-ink-400">{formatDate(inquiry.created_at)}</span>
                  <InquiryStatusBadge status={inquiry.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
