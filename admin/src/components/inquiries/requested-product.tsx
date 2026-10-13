import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { ContactInquiry } from "@/lib/api/types";
import { formatPrice } from "@/lib/utils";
import { whatsappChatLink, whatsappShareLink } from "@/lib/whatsapp";

/**
 * On a price request: the product the customer is asking about (its
 * pictures, quantity and real price — which the website hides from
 * customers) and WhatsApp buttons for answering them.
 */
export function RequestedProduct({
  inquiry,
  hideAllPrices,
  canOpenProduct,
}: {
  inquiry: ContactInquiry;
  hideAllPrices: boolean;
  /** Only people who can edit the catalog get the link to the product's admin page. */
  canOpenProduct: boolean;
}) {
  const product = inquiry.product;

  if (!product) {
    return inquiry.type === "price_request" ? (
      <div className="rounded-card border border-ink-200 bg-white p-5 text-sm text-ink-600 shadow-card">
        The product for this request has been deleted.
      </div>
    ) : null;
  }

  // Every picture the product has, main one first, without repeats.
  const pictures = Array.from(
    new Set(
      [product.header_image_url, product.thumbnail_url, product.banner_image_url, ...(product.images ?? []).map((i) => i.url)].filter(
        (url): url is string => Boolean(url),
      ),
    ),
  );

  const quantity = inquiry.quantity ?? product.min_quantity;
  const unitPrice = Number(product.base_price);
  const hasPrice = unitPrice > 0;
  const total = unitPrice * quantity;
  const hiddenOnSite = hideAllPrices || Boolean(product.price_on_request);

  const priceLine = hasPrice ? `Price: ${formatPrice(unitPrice)} per piece — ${formatPrice(total)} for ${quantity}.` : "";

  const toCustomer = whatsappChatLink(
    inquiry.phone,
    [
      `Hello ${inquiry.name}, this is Guru Ganesh Graphics.`,
      `About your price request for ${quantity} × ${product.name}:`,
      priceLine,
      "Let us know if you would like to go ahead.",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const shareWithStaff = whatsappShareLink(
    [
      `Price request #${inquiry.id}`,
      `Customer: ${inquiry.name}${inquiry.phone ? `, ${inquiry.phone}` : ""}`,
      `Product: ${product.name}${product.category ? ` (${product.category.name})` : ""}`,
      `Quantity: ${quantity}`,
      priceLine,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return (
    <div className="rounded-card border border-ink-200 bg-white p-5 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Product requested</h2>

      <div className="mt-4 grid gap-5 sm:grid-cols-[220px_1fr]">
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-ink-100 bg-ink-50">
            {pictures[0] ? (
              <Image src={pictures[0]} alt={product.name} fill sizes="220px" className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-ink-400">No picture</div>
            )}
          </div>

          {pictures.length > 1 ? (
            <ul className="mt-2 grid grid-cols-4 gap-1.5">
              {pictures.map((url) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noreferrer" title="Open full size" className="relative block aspect-square overflow-hidden rounded-lg border border-ink-100">
                    <Image src={url} alt="" fill sizes="60px" className="object-cover" unoptimized />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="min-w-0">
          {product.category ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-700">{product.category.name}</p>
          ) : null}
          <p className="font-display text-xl font-semibold text-ink-900">{product.name}</p>
          {canOpenProduct ? (
            <Link href={`/products/${encodeURIComponent(product.slug)}` as Route} className="text-xs font-medium text-accent-600 hover:underline">
              Open this product
            </Link>
          ) : null}

          <dl className="mt-4 grid grid-cols-[130px_1fr] gap-y-2 text-sm">
            <dt className="text-ink-500">Quantity asked</dt>
            <dd className="font-semibold text-ink-900">{quantity}</dd>

            <dt className="text-ink-500">Price per piece</dt>
            <dd className="text-ink-900">
              {hasPrice ? (
                <>
                  <span className="font-semibold">{formatPrice(unitPrice)}</span>
                  {hiddenOnSite ? (
                    <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      hidden on the website
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-ink-500">Not set yet — add it on the product</span>
              )}
            </dd>

            {hasPrice ? (
              <>
                <dt className="text-ink-500">For {quantity}</dt>
                <dd className="font-semibold text-ink-900">{formatPrice(total)}</dd>
              </>
            ) : null}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            {toCustomer ? (
              <a
                href={toCustomer}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#25D366] px-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <WhatsAppIcon />
                Reply to customer on WhatsApp
              </a>
            ) : null}
            <a
              href={shareWithStaff}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-ink-200 px-3.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
            >
              <WhatsAppIcon className="text-[#25D366]" />
              Share details with staff
            </a>
          </div>
          <p className="mt-2 text-xs text-ink-500">
            Opens WhatsApp with the message typed out — you press Send. If the customer&apos;s number isn&apos;t on WhatsApp,
            WhatsApp will tell you.
          </p>
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.3.6a2.8 2.8 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z" />
    </svg>
  );
}
