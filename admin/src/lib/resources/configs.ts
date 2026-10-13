import type { ResourceConfig } from "./types";

/**
 * One entry per generic, config-driven CRUD resource — everything covered
 * by the shared ResourceTable / ResourceForm components. Media (custom grid
 * + upload) and Inquiries (custom inbox, no create form) are handled by
 * their own screens instead of this system; see app/(dashboard)/media and
 * app/(dashboard)/inquiries.
 *
 * `key` is this admin app's own URL segment; `endpoint` is the Laravel API's
 * URI segment (routes/api.php's $catalogResources) — the two are usually the
 * same word but aren't required to be (e.g. "subcategories" here maps to
 * "product-subcategories" on the API).
 */
export const resourceConfigs: Record<string, ResourceConfig> = {
  products: {
    key: "products",
    label: "Products",
    singularLabel: "Product",
    endpoint: "products",
    paginated: true,
    recordKey: "slug",
    supportsInactiveToggle: true,
    relationFilter: { field: "category", label: "Category" },
    featuredToggle: {
      field: "is_featured",
      queryParam: "featured",
      max: 4,
      onLabel: "Set as homepage featured product",
      offLabel: "Remove from homepage featured products",
    },
    columns: [
      { key: "thumbnail_url", label: "", type: "image" },
      { key: "name", label: "Name" },
      { key: "category.name", label: "Category" },
      { key: "base_price", label: "Price", type: "price" },
      { key: "is_featured", label: "Homepage featured", type: "boolean" },
      { key: "status", label: "Active", type: "boolean" },
    ],
    fields: [
      { name: "category_id", label: "Category", type: "relation", required: true, relation: { configKey: "categories", labelField: "name" } },
      { name: "subcategory_id", label: "Subcategory", type: "relation", relation: { configKey: "subcategories", labelField: "name" } },
      { name: "design_mode_id", label: "Design mode", type: "relation", relation: { configKey: "design-modes", labelField: "name" } },
      { name: "delivery_option_id", label: "Delivery option", type: "relation", relation: { configKey: "delivery-options", labelField: "name" } },
      { name: "product_type_id", label: "Product type", type: "relation", relation: { configKey: "product-types", labelField: "name" } },
      { name: "pricing_tier_id", label: "Pricing tier", type: "relation", relation: { configKey: "pricing-tiers", labelField: "name" } },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, helpText: "Used in the public product URL." },
      { name: "description", label: "Description", type: "textarea" },
      { name: "base_price", label: "Base price (₹)", type: "decimal", required: true },
      {
        name: "price_on_request",
        label: "Ask for price (hide this product's price on the website)",
        type: "boolean",
        helpText: "When on, customers see \"Ask for price\" instead of the price and send you a price request. You still enter the real price above for your own records.",
      },
      { name: "min_quantity", label: "Minimum quantity", type: "number", required: true },
      { name: "max_quantity", label: "Maximum quantity", type: "number" },
      {
        name: "is_featured",
        label: "Homepage featured product",
        type: "boolean",
        helpText:
          "Shows this product as one of the big promotional cards on the homepage (below the hero slider, which is managed separately under Homepage Slides). Keep the total at 2 or 4 (max 4) for a balanced layout — avoid leaving it at 1 or 3.",
      },
      {
        name: "banner_headline",
        label: "Homepage banner headline",
        type: "text",
        helpText:
          "Only used when this product is homepage featured — the bold headline on its homepage promo card (e.g. \"Make Every Connection Count\"). Leave blank to just show the product name.",
      },
      {
        name: "banner_subtext",
        label: "Homepage banner subtext",
        type: "textarea",
        helpText: "The short line under the headline. Leave blank to fall back to a generic price line.",
      },
      { name: "status", label: "Active (visible on the site)", type: "boolean" },
      { name: "meta_title", label: "Meta title", type: "text" },
      { name: "meta_description", label: "Meta description", type: "textarea" },
      { name: "thumbnail", label: "Thumbnail image", type: "file", accept: "image/*", currentUrlField: "thumbnail_url" },
      { name: "header_image", label: "Header image", type: "file", accept: "image/*", currentUrlField: "header_image_url" },
      {
        name: "banner_image",
        label: "Homepage banner image",
        type: "file",
        accept: "image/*",
        currentUrlField: "banner_image_url",
        helpText:
          "Used on the homepage promo card when this product is featured. Falls back to the header image, then the thumbnail, if left blank.",
      },
    ],
  },

  categories: {
    key: "categories",
    label: "Categories",
    singularLabel: "Category",
    endpoint: "categories",
    paginated: false,
    pageSize: 10,
    recordKey: "id",
    columns: [
      { key: "image_url", label: "", type: "image" },
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
      { key: "show_in_menu", label: "In header menu", type: "boolean" },
      { key: "menu_order", label: "Menu order" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      {
        name: "show_in_menu",
        label: "Show in the header menu bar",
        type: "boolean",
        helpText:
          "Only categories ticked here appear as quick links in the bar under the site header. Tick about 5 to 7 so the bar stays on one line — every category is still available under \"All categories\".",
      },
      {
        name: "menu_order",
        label: "Menu order",
        type: "number",
        helpText: "Lower numbers come first in the header bar and in \"All categories\" (1 = first).",
      },
      {
        name: "image",
        label: "Category image",
        type: "file",
        accept: "image/*",
        currentUrlField: "image_url",
        helpText: "Shown on the category tiles on the homepage and the Shop page. Square (1:1) images look best.",
      },
      { name: "meta_title", label: "Meta title", type: "text" },
      { name: "meta_description", label: "Meta description", type: "textarea" },
    ],
  },

  subcategories: {
    key: "subcategories",
    label: "Subcategories",
    singularLabel: "Subcategory",
    endpoint: "product-subcategories",
    paginated: false,
    recordKey: "id",
    relationFilter: { field: "category", label: "Category" },
    columns: [
      { key: "image_url", label: "", type: "image" },
      { key: "name", label: "Name" },
      { key: "category.name", label: "Category" },
      { key: "slug", label: "Slug" },
    ],
    fields: [
      { name: "category_id", label: "Category", type: "relation", required: true, relation: { configKey: "categories", labelField: "name" } },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "meta_title", label: "Meta title", type: "text" },
      { name: "meta_description", label: "Meta description", type: "textarea" },
      {
        name: "image",
        label: "Thumbnail image",
        type: "file",
        accept: "image/*",
        currentUrlField: "image_url",
        helpText:
          "Shown next to this subcategory's name in the header's category dropdown menu on the storefront. Leave blank to just show the name with no thumbnail.",
      },
    ],
  },

  "design-modes": {
    key: "design-modes",
    label: "Design Modes",
    singularLabel: "Design mode",
    endpoint: "design-modes",
    paginated: false,
    pageSize: 10,
    recordKey: "id",
    columns: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },

  "delivery-options": {
    key: "delivery-options",
    label: "Delivery Options",
    singularLabel: "Delivery option",
    endpoint: "delivery-options",
    paginated: false,
    pageSize: 10,
    recordKey: "id",
    columns: [
      { key: "name", label: "Name" },
      { key: "estimated_days", label: "Estimated days" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "estimated_days", label: "Estimated days", type: "number" },
    ],
  },

  "product-types": {
    key: "product-types",
    label: "Product Types",
    singularLabel: "Product type",
    endpoint: "product-types",
    paginated: false,
    pageSize: 10,
    recordKey: "id",
    columns: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
    ],
  },

  "pricing-tiers": {
    key: "pricing-tiers",
    label: "Pricing Tiers",
    singularLabel: "Pricing tier",
    endpoint: "pricing-tiers",
    paginated: false,
    pageSize: 10,
    recordKey: "id",
    columns: [
      { key: "name", label: "Name" },
      { key: "price_multiplier", label: "Multiplier" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "price_multiplier", label: "Price multiplier", type: "decimal", required: true, helpText: "e.g. 1.25 for a 25% markup." },
    ],
  },

  brands: {
    key: "brands",
    label: "Brands",
    singularLabel: "Brand",
    endpoint: "brands",
    paginated: false,
    pageSize: 10,
    recordKey: "id",
    supportsInactiveToggle: true,
    columns: [
      { key: "name", label: "Name" },
      { key: "status", label: "Active", type: "boolean" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "website_url", label: "Website URL", type: "text" },
      { name: "status", label: "Active (visible on the site)", type: "boolean" },
      { name: "logo", label: "Logo", type: "file", accept: "image/*", currentUrlField: "logo_url" },
    ],
  },

  blogs: {
    key: "blogs",
    label: "Blog Posts",
    singularLabel: "Blog post",
    endpoint: "blogs",
    paginated: true,
    pageSize: 10,
    recordKey: "slug",
    supportsInactiveToggle: true,
    inactiveParam: "include_drafts",
    columns: [
      { key: "title", label: "Title" },
      { key: "status", label: "Published", type: "boolean" },
      { key: "published_at", label: "Published at", type: "date" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, helpText: "The web address of the post, e.g. choose-right-paper. Spaces and capitals are tidied up automatically." },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "content", label: "Content", type: "richtext", required: true, helpText: "Write like in a document: use the buttons for headings, bold, lists and links. You can paste from Word or Google Docs." },
      { name: "status", label: "Published", type: "boolean" },
      { name: "published_at", label: "Published at", type: "date" },
      { name: "meta_title", label: "Meta title", type: "text" },
      { name: "meta_description", label: "Meta description", type: "textarea" },
      { name: "thumbnail", label: "Thumbnail image", type: "file", accept: "image/*", currentUrlField: "thumbnail_url" },
    ],
  },

  testimonials: {
    key: "testimonials",
    label: "Testimonials",
    singularLabel: "Testimonial",
    endpoint: "testimonials",
    paginated: false,
    pageSize: 10,
    recordKey: "id",
    supportsInactiveToggle: true,
    columns: [
      { key: "customer_name", label: "Customer" },
      { key: "rating", label: "Rating" },
      { key: "status", label: "Active", type: "boolean" },
    ],
    fields: [
      { name: "customer_name", label: "Customer name", type: "text", required: true },
      { name: "customer_company", label: "Company", type: "text" },
      { name: "rating", label: "Rating (1–5)", type: "number", required: true },
      { name: "message", label: "Message", type: "textarea", required: true },
      { name: "status", label: "Active (visible on the site)", type: "boolean" },
      { name: "avatar", label: "Avatar", type: "file", accept: "image/*", currentUrlField: "avatar_url" },
    ],
  },

  sliders: {
    key: "sliders",
    label: "Homepage Slides",
    singularLabel: "Slide",
    endpoint: "sliders",
    paginated: false,
    pageSize: 10,
    recordKey: "id",
    supportsInactiveToggle: true,
    columns: [
      { key: "image_url", label: "", type: "image" },
      { key: "title", label: "Title" },
      { key: "sort_order", label: "Order" },
      { key: "status", label: "Active", type: "boolean" },
    ],
    fields: [
      {
        name: "title",
        label: "Title",
        type: "text",
        helpText: "The slide's heading. Leave blank to fall back to the site name.",
      },
      {
        name: "subtitle",
        label: "Subtitle",
        type: "text",
        helpText: "The short line shown under the title. Leave blank to omit it.",
      },
      {
        name: "link_url",
        label: "Link URL",
        type: "text",
        helpText:
          "Where the \"Get more details\" button goes — a product page, a category, or any URL. Leave blank to hide that button and only show \"View all products\".",
      },
      {
        name: "sort_order",
        label: "Sort order",
        type: "number",
        helpText: "Lower numbers show first (0 is default). Give each slide a different number to control the order.",
      },
      { name: "status", label: "Active (visible on the site)", type: "boolean" },
      {
        name: "image",
        label: "Slide image",
        type: "file",
        required: true,
        accept: "image/*",
        currentUrlField: "image_url",
      },
    ],
  },

  services: {
    key: "services",
    label: "Services",
    singularLabel: "Service",
    endpoint: "services",
    paginated: false,
    pageSize: 10,
    recordKey: "id",
    supportsInactiveToggle: true,
    columns: [
      { key: "name", label: "Name" },
      { key: "status", label: "Active", type: "boolean" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "short_description", label: "Short description", type: "textarea" },
      { name: "content", label: "Content", type: "textarea" },
      { name: "status", label: "Active (visible on the site)", type: "boolean" },
      { name: "meta_title", label: "Meta title", type: "text" },
      { name: "meta_description", label: "Meta description", type: "textarea" },
      { name: "icon", label: "Icon", type: "file", accept: "image/*", currentUrlField: "icon_url" },
      { name: "image", label: "Image", type: "file", accept: "image/*", currentUrlField: "image_url" },
    ],
  },
};

export function getResourceConfig(key: string): ResourceConfig {
  const config = resourceConfigs[key];
  if (!config) throw new Error(`Unknown resource config key: ${key}`);
  return config;
}
