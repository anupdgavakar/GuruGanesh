<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductDeliveryOption;
use App\Models\ProductDesignMode;
use App\Models\ProductPricingTier;
use App\Models\ProductType;
use Illuminate\Database\Seeder;

/**
 * Phase 1 of the full GuruGanesh Graphics catalog — 12 of the 26 top-level
 * categories the owner mapped out, chosen as the "everyday local print
 * shop" core: paper-based business/office printing, signage, stickers,
 * packaging and stationery that carries the widest day-one demand. The
 * remaining 14 categories (apparel, gifting, wedding/event, and vertical-
 * specific work like election, school, restaurant, real estate and
 * industrial printing) are Phase 2 — a separate CatalogPhaseTwoSeeder to
 * follow once Phase 1 is live. See docs/catalog-phases.md (project notes)
 * for the full category-by-category split and reasoning.
 *
 * Same three-level shape as the old CatalogSeeder it replaces (category ->
 * subcategory -> products), just at real scale: every subcategory here is
 * one of the owner's named groups, and every product is one of the owner's
 * named line items, each with its own price/quantity/description rather
 * than being invented from scratch.
 *
 * A handful of item names repeat verbatim across two different categories
 * in the owner's original list (e.g. "Thank You Cards" shows up under
 * Promotional Prints, Packaging Accessories AND Retail Cards). Since
 * products.slug is globally unique, those repeats are disambiguated with a
 * short context qualifier on the *second* occurrence's name (e.g. "Thank
 * You Insert Cards" for the packaging one) rather than being dropped —
 * every line item from the owner's list is still represented somewhere.
 *
 * Must run AFTER DatabaseSeeder has created the design modes, delivery
 * options, product types and pricing tiers — same dependency as the old
 * CatalogSeeder.
 */
class CatalogPhaseOneSeeder extends Seeder
{
    public function run(): void
    {
        $designModeIds = ProductDesignMode::pluck('id')->all();
        $deliveryOptionIds = ProductDeliveryOption::pluck('id')->all();
        $productTypeIds = ProductType::pluck('id')->all();
        $pricingTierIds = ProductPricingTier::pluck('id')->all();

        // One flagship item per category, spread across the rail — mirrors
        // the old CatalogSeeder's featuredSlugs approach.
        $featuredSlugs = [
            'nfc-visiting-cards',
            'premium-letterheads',
            'personalised-diaries',
            'self-inking-stamps',
            'tri-fold-brochures',
            'vinyl-banners',
            'led-sign-boards',
            'custom-die-cut-stickers-sheet',
            'premium-gift-bags',
            'gift-cards-retail',
            'photo-calendars',
            'acrylic-coasters',
        ];

        $n = 0;

        foreach ($this->catalog() as $categoryData) {
            $category = ProductCategory::create([
                'name' => $categoryData['name'],
                'slug' => $categoryData['slug'],
                'meta_title' => "{$categoryData['name']} | GuruGanesh Graphics",
                'meta_description' => $categoryData['blurb'],
            ]);

            foreach ($categoryData['subcategories'] as $subData) {
                $subcategory = $category->subcategories()->create([
                    'name' => $subData['name'],
                    'slug' => $subData['slug'],
                ]);

                foreach ($subData['products'] as $productData) {
                    Product::create([
                        'category_id' => $category->id,
                        'subcategory_id' => $subcategory->id,
                        'design_mode_id' => $designModeIds[$n % max(count($designModeIds), 1)] ?? null,
                        'delivery_option_id' => $deliveryOptionIds[$n % max(count($deliveryOptionIds), 1)] ?? null,
                        'product_type_id' => $productTypeIds[$n % max(count($productTypeIds), 1)] ?? null,
                        'pricing_tier_id' => $pricingTierIds[$n % max(count($pricingTierIds), 1)] ?? null,
                        'name' => $productData['name'],
                        'slug' => $productData['slug'],
                        'description' => $productData['description'],
                        'base_price' => $productData['price'],
                        'min_quantity' => $productData['min'],
                        'max_quantity' => $productData['max'],
                        'status' => true,
                        'is_featured' => in_array($productData['slug'], $featuredSlugs, true),
                        'meta_title' => "{$productData['name']} | GuruGanesh Graphics",
                        'meta_description' => $productData['description'],
                    ]);

                    $n++;
                }
            }
        }
    }

    /**
     * @return array<int, array{
     *     name: string, slug: string, blurb: string,
     *     subcategories: array<int, array{
     *         name: string, slug: string,
     *         products: array<int, array{name: string, slug: string, price: float, min: int, max: int, description: string}>,
     *     }>,
     * }>
     */
    private function catalog(): array
    {
        $p = fn (string $name, string $slug, float $price, int $min, int $max, string $description) =>
            compact('name', 'slug', 'price', 'min', 'max', 'description');

        return [
            // 1. Visiting Cards -------------------------------------------
            [
                'name' => 'Visiting Cards',
                'slug' => 'visiting-cards',
                'blurb' => 'Visiting cards in every finish, shape and material — from everyday matte cards to NFC and metal.',
                'subcategories' => [
                    [
                        'name' => 'Standard Visiting Cards', 'slug' => 'standard-visiting-cards',
                        'products' => [
                            $p('Standard Visiting Cards', 'standard-visiting-cards-std', 199, 100, 20000, 'Everyday 300gsm visiting cards, printed fast and priced for volume.'),
                            $p('Classic Visiting Cards', 'classic-visiting-cards', 229, 100, 20000, 'A timeless single-colour or full-colour card for everyday business use.'),
                            $p('Matte Visiting Cards', 'matte-visiting-cards', 249, 100, 20000, 'Smooth matte-finish cards for a professional, non-reflective look.'),
                            $p('Glossy Visiting Cards', 'glossy-visiting-cards', 249, 100, 20000, 'High-shine glossy coating that makes colours and logos pop.'),
                            $p('Double-Sided Visiting Cards', 'double-sided-visiting-cards', 279, 100, 20000, 'Front-and-back printing to fit twice the information on one card.'),
                            $p('Bulk Visiting Cards', 'bulk-visiting-cards', 179, 500, 50000, 'Our lowest per-card rate for large-quantity office and franchise orders.'),
                        ],
                    ],
                    [
                        'name' => 'Premium Visiting Cards', 'slug' => 'premium-visiting-cards',
                        'products' => [
                            $p('Premium Visiting Cards', 'premium-visiting-cards-std', 499, 100, 10000, 'Thicker premium stock with a noticeably sturdier feel in hand.'),
                            $p('Premium Plus Visiting Cards', 'premium-plus-visiting-cards', 649, 100, 10000, 'Our top standard-stock tier — extra thickness plus a refined edge finish.'),
                            $p('Velvet Touch Visiting Cards', 'velvet-touch-visiting-cards', 799, 100, 5000, 'A soft-touch velvet laminate that feels as good as it looks.'),
                            $p('Pearl Visiting Cards', 'pearl-visiting-cards', 749, 100, 5000, 'Subtle pearlescent shimmer stock for a distinctive, upscale card.'),
                            $p('Kraft Visiting Cards', 'kraft-visiting-cards', 549, 100, 5000, 'Natural, eco-friendly kraft stock with visible texture and warmth.'),
                            $p('Diamond Visiting Cards', 'diamond-visiting-cards', 1499, 50, 2500, 'Our most premium tier — layered stock with a faceted, jewel-like edge.'),
                            $p('Non-Tearable Visiting Cards', 'non-tearable-visiting-cards', 899, 100, 5000, 'Synthetic, water- and tear-resistant stock built to survive a wallet.'),
                            $p('Transparent Visiting Cards', 'transparent-visiting-cards', 1199, 50, 2500, 'Clear plastic cards that print in white ink for a see-through look.'),
                            $p('Magnetic Visiting Cards', 'magnetic-visiting-cards', 1799, 50, 2500, 'A card that doubles as a fridge magnet, so it never gets thrown away.'),
                        ],
                    ],
                    [
                        'name' => 'Special Shape Visiting Cards', 'slug' => 'special-shape-visiting-cards',
                        'products' => [
                            $p('Rounded Corner Visiting Cards', 'rounded-corner-visiting-cards', 349, 100, 10000, 'Standard rectangle cards softened with rounded corners.'),
                            $p('Square Visiting Cards', 'square-visiting-cards', 379, 100, 10000, 'A distinctive square format that stands out in any card holder.'),
                            $p('Circle Visiting Cards', 'circle-visiting-cards', 449, 100, 5000, 'Fully die-cut circular cards for a bold, memorable shape.'),
                            $p('Oval Visiting Cards', 'oval-visiting-cards', 449, 100, 5000, 'Smooth oval die-cut cards, a softer alternative to the circle.'),
                            $p('Leaf Shape Visiting Cards', 'leaf-shape-visiting-cards', 499, 100, 5000, 'A leaf-shaped die cut, popular with salons, spas and eco-brands.'),
                        ],
                    ],
                    [
                        'name' => 'Premium Finish Visiting Cards', 'slug' => 'premium-finish-visiting-cards',
                        'products' => [
                            $p('Spot UV Visiting Cards', 'spot-uv-visiting-cards', 699, 100, 5000, 'Matte base with a glossy raised UV coating on your logo or text.'),
                            $p('Raised UV Visiting Cards', 'raised-uv-visiting-cards', 799, 100, 5000, 'A thicker, more tactile UV coating you can feel as well as see.'),
                            $p('Foil Visiting Cards', 'foil-visiting-cards', 899, 100, 5000, 'Metallic gold, silver or copper foil stamping on premium card stock.'),
                            $p('Raised Foil Visiting Cards', 'raised-foil-visiting-cards', 1099, 100, 2500, 'Foil stamping combined with an embossed, raised texture.'),
                            $p('Embossed Visiting Cards', 'embossed-visiting-cards', 999, 100, 2500, 'A pressed, three-dimensional emboss on your logo or initials.'),
                        ],
                    ],
                    [
                        'name' => 'Digital Visiting Cards', 'slug' => 'digital-visiting-cards',
                        'products' => [
                            $p('QR Code Visiting Cards', 'qr-code-visiting-cards', 349, 100, 5000, 'A printed card with a scannable QR code linking to your contact or page.'),
                            $p('Digital Business Cards', 'digital-business-cards', 499, 1, 500, 'A shareable digital card link/page, no physical printing required.'),
                            $p('NFC Visiting Cards', 'nfc-visiting-cards', 799, 1, 500, 'Tap-to-share NFC chip embedded in a physical card — no app needed.'),
                            $p('WhatsApp QR Visiting Cards', 'whatsapp-qr-visiting-cards', 349, 100, 5000, 'A QR code that opens a pre-filled WhatsApp chat with your business.'),
                            $p('Google Review QR Cards', 'google-review-qr-cards', 299, 100, 5000, 'A QR code that takes customers straight to your Google review page.'),
                            $p('Social Media QR Cards', 'social-media-qr-cards', 299, 100, 5000, 'A QR code linking to your Instagram, Facebook or link-in-bio page.'),
                        ],
                    ],
                    [
                        'name' => 'Visiting Card Accessories', 'slug' => 'visiting-card-accessories',
                        'products' => [
                            $p('Metal Visiting Card Holders', 'metal-visiting-card-holders', 349, 1, 500, 'A slim brushed-metal case that keeps cards crisp in a pocket or bag.'),
                            $p('Premium Metal Card Holders', 'premium-metal-card-holders', 599, 1, 500, 'A heavier-gauge metal holder with a polished, executive finish.'),
                            $p('Engraved Metal Card Holders', 'engraved-metal-card-holders', 799, 1, 200, 'A metal card holder laser-engraved with your name or logo.'),
                            $p('Leatherette Card Holders', 'leatherette-card-holders', 249, 1, 500, 'A soft leatherette case with a stitched edge and card slots.'),
                            $p('Acrylic Card Holders', 'acrylic-card-holders', 149, 1, 500, 'A clear countertop stand for displaying your own cards to visitors.'),
                        ],
                    ],
                ],
            ],

            // 2. Business Stationery ---------------------------------------
            [
                'name' => 'Business Stationery',
                'slug' => 'business-stationery',
                'blurb' => 'Letterheads, envelopes, office books, ID cards and certificates for everyday business paperwork.',
                'subcategories' => [
                    [
                        'name' => 'Letterheads', 'slug' => 'letterheads',
                        'products' => [
                            $p('Company Letterheads', 'company-letterheads', 349, 100, 10000, 'Branded letterheads for official company correspondence.'),
                            $p('Personal Letterheads', 'personal-letterheads', 299, 100, 5000, 'A personal letterhead for professionals, consultants and freelancers.'),
                            $p('Premium Letterheads', 'premium-letterheads', 549, 100, 5000, 'Heavier premium stock for a more formal, boardroom-ready letterhead.'),
                            $p('Colour Letterheads', 'colour-letterheads', 399, 100, 10000, 'Full-colour letterheads for logos and headers with brand colour.'),
                            $p('Bulk Letterheads', 'bulk-letterheads', 279, 500, 50000, 'Our lowest per-sheet rate for large recurring letterhead orders.'),
                            $p('Letterhead Pads', 'letterhead-pads', 249, 10, 2000, 'Letterhead sheets glue-bound into tear-off pads of 50.'),
                        ],
                    ],
                    [
                        'name' => 'Envelopes', 'slug' => 'envelopes',
                        'products' => [
                            $p('Printed Envelopes', 'printed-envelopes', 299, 100, 10000, 'Standard envelopes printed with your logo and return address.'),
                            $p('Company Envelopes', 'company-envelopes', 329, 100, 10000, 'A matched envelope set designed to pair with your letterhead.'),
                            $p('Window Envelopes', 'window-envelopes', 349, 100, 10000, 'Envelopes with a cut-out window so the address shows through.'),
                            $p('Non-Window Envelopes', 'non-window-envelopes', 299, 100, 10000, 'A plain-face envelope for hand-addressed or labelled mail.'),
                            $p('Custom Size Envelopes', 'custom-size-envelopes', 399, 100, 5000, 'Envelopes cut and printed to a size that isn’t off-the-shelf.'),
                            $p('Premium Envelopes', 'premium-envelopes', 549, 100, 5000, 'Heavier textured stock for invitations and formal correspondence.'),
                        ],
                    ],
                    [
                        'name' => 'Office Books', 'slug' => 'office-books',
                        'products' => [
                            $p('Bill Books', 'bill-books', 149, 10, 2000, 'Duplicate or triplicate bill books numbered for daily billing.'),
                            $p('Invoice Books', 'invoice-books', 159, 10, 2000, 'GST-ready invoice books with carbonless duplicate copies.'),
                            $p('Receipt Books', 'receipt-books', 139, 10, 2000, 'Numbered receipt books for cash and payment acknowledgements.'),
                            $p('Cash Memo Books', 'cash-memo-books', 139, 10, 2000, 'Simple cash memo books for small retail and counter sales.'),
                            $p('Quotation Books', 'quotation-books', 159, 10, 2000, 'Pre-formatted quotation books for fast on-site estimates.'),
                            $p('Delivery Challan Books', 'delivery-challan-books', 149, 10, 2000, 'Duplicate delivery challan books for dispatch and logistics.'),
                            $p('Order Books', 'order-books', 149, 10, 2000, 'Numbered order books for sales teams and field agents.'),
                            $p('Estimate Books', 'estimate-books', 149, 10, 2000, 'Pre-formatted estimate books for jobs quoted on the spot.'),
                            $p('Voucher Books', 'voucher-books', 139, 10, 2000, 'Numbered voucher books for internal expense and petty cash use.'),
                            $p('Payment Receipt Books', 'payment-receipt-books', 139, 10, 2000, 'Duplicate payment receipt books for recording customer payments.'),
                        ],
                    ],
                    [
                        'name' => 'Office Identity', 'slug' => 'office-identity',
                        'products' => [
                            $p('ID Cards', 'id-cards', 79, 10, 5000, 'Standard printed identity cards for staff and visitors.'),
                            $p('PVC ID Cards', 'pvc-id-cards', 129, 10, 5000, 'Durable plastic PVC cards that hold up to daily handling.'),
                            $p('Paper ID Cards', 'paper-id-cards', 49, 10, 5000, 'A budget paper ID card, laminated for short-term or event use.'),
                            $p('Employee ID Cards', 'employee-id-cards', 129, 10, 5000, 'PVC staff ID cards with photo, name and designation.'),
                            $p('Visitor ID Cards', 'visitor-id-cards', 59, 10, 5000, 'Reusable or single-use visitor badges for front-desk sign-in.'),
                            $p('Lanyards', 'lanyards', 49, 25, 5000, 'Printed fabric lanyards to carry ID cards and badges.'),
                            $p('ID Card Holders', 'id-card-holders', 29, 25, 5000, 'Clear plastic holders that protect a printed ID card.'),
                            $p('Employee Welcome Kits', 'employee-welcome-kits', 499, 5, 1000, 'A bundled new-joiner kit — ID card, lanyard, notebook and pen.'),
                        ],
                    ],
                    [
                        'name' => 'Certificates & Recognition', 'slug' => 'certificates-recognition',
                        'products' => [
                            $p('Certificates', 'certificates', 199, 50, 5000, 'General-purpose certificates on quality stock, ready for signing.'),
                            $p('Achievement Certificates', 'achievement-certificates', 219, 50, 5000, 'Certificates designed to recognise a specific achievement or milestone.'),
                            $p('Training Certificates', 'training-certificates', 219, 50, 5000, 'Completion certificates for workshops, courses and training programs.'),
                            $p('School Certificates', 'school-certificates', 199, 50, 5000, 'Certificates formatted for school events, sports days and exams.'),
                            $p('College Certificates', 'college-certificates', 199, 50, 5000, 'Certificates formatted for college events, fests and courses.'),
                            $p('Appreciation Certificates', 'appreciation-certificates', 219, 50, 5000, 'A warmer certificate design for thanking staff, vendors or volunteers.'),
                            $p('Awards', 'awards', 599, 5, 500, 'Printed or engraved award plates mounted for presentation.'),
                            $p('Plaques', 'plaques', 799, 5, 500, 'Wooden or acrylic plaques for formal recognition and milestones.'),
                            $p('Mementos', 'mementos', 449, 5, 500, 'Small keepsake mementos for guests, speakers or award winners.'),
                        ],
                    ],
                ],
            ],

            // 3. Notebooks, Diaries & Office Writing ------------------------
            [
                'name' => 'Notebooks, Diaries & Office Writing',
                'slug' => 'notebooks-diaries-writing',
                'blurb' => 'Custom notebooks, diaries and branded pens for everyday office and corporate gifting use.',
                'subcategories' => [
                    [
                        'name' => 'Notebooks', 'slug' => 'notebooks',
                        'products' => [
                            $p('Custom Notebooks', 'custom-notebooks', 129, 25, 5000, 'A fully custom cover and page layout, built to your brief.'),
                            $p('A4 Notebooks', 'a4-notebooks', 149, 25, 5000, 'Full-size A4 notebooks for meeting notes and planning.'),
                            $p('A5 Notebooks', 'a5-notebooks', 99, 25, 5000, 'Compact A5 notebooks, the everyday desk and bag size.'),
                            $p('A6 Notebooks', 'a6-notebooks', 69, 25, 5000, 'Pocket-size A6 notebooks for quick notes on the go.'),
                            $p('Spiral Notebooks', 'spiral-notebooks', 119, 25, 5000, 'Wire-bound spiral notebooks that lie flat when open.'),
                            $p('Hardbound Notebooks', 'hardbound-notebooks', 199, 25, 2000, 'A rigid hardcover notebook built to survive daily carry.'),
                            $p('Softbound Notebooks', 'softbound-notebooks', 109, 25, 5000, 'A flexible soft cover notebook, light and easy to carry.'),
                            $p('Personalised Notebooks', 'personalised-notebooks', 149, 25, 2000, 'A notebook cover personalised with a name, initials or logo.'),
                            $p('Custom Notepads', 'custom-notepads', 79, 25, 5000, 'Glue-bound tear-off notepads printed with your branding.'),
                        ],
                    ],
                    [
                        'name' => 'Diaries', 'slug' => 'diaries',
                        'products' => [
                            $p('Personalised Diaries', 'personalised-diaries', 249, 10, 2000, 'A dated diary personalised with a name, initials or logo.'),
                            $p('A5 Diaries', 'a5-diaries', 199, 10, 2000, 'A compact, everyday A5 dated diary.'),
                            $p('Executive Diaries', 'executive-diaries', 349, 10, 1000, 'A larger-format diary with a more formal, executive cover.'),
                            $p('Diaries with Pen Holder', 'diaries-with-pen-holder', 299, 10, 1000, 'A diary with a built-in elastic loop to hold a pen.'),
                            $p('Magnetic Lock Diaries', 'magnetic-lock-diaries', 379, 10, 1000, 'A diary with a magnetic flap closure for a premium finish.'),
                            $p('Corporate Diaries', 'corporate-diaries', 329, 25, 2000, 'A branded diary designed for year-end corporate gifting.'),
                            $p('Premium Diaries', 'premium-diaries', 449, 10, 1000, 'Our top-tier diary — leatherette cover, ribbon and premium paper.'),
                        ],
                    ],
                    [
                        'name' => 'Writing Accessories', 'slug' => 'writing-accessories',
                        'products' => [
                            $p('Custom Pens', 'custom-pens', 19, 50, 5000, 'A pen barrel printed with your logo or message.'),
                            $p('Promotional Pens', 'promotional-pens', 15, 100, 10000, 'Our most economical pen for large giveaway quantities.'),
                            $p('Ball Pens', 'ball-pens', 19, 50, 5000, 'Standard smooth-writing ball pens, custom printed.'),
                            $p('Gel Pens', 'gel-pens', 25, 50, 5000, 'Smooth gel-ink pens with a more premium writing feel.'),
                            $p('Metal Pens', 'metal-pens', 89, 25, 2000, 'A metal-bodied pen with real weight and a polished finish.'),
                            $p('Executive Pens', 'executive-pens', 129, 25, 2000, 'A formal metal pen suited to boxed gifting.'),
                            $p('Premium Pens', 'premium-pens', 179, 25, 1000, 'A step above executive — finer trims and a smoother mechanism.'),
                            $p('Luxury Pens', 'luxury-pens', 349, 10, 500, 'Our top-tier pen, gift-boxed for leadership and client gifting.'),
                            $p('Wooden Finish Pens', 'wooden-finish-pens', 99, 25, 2000, 'A pen with a natural wood-grain barrel for an eco, earthy look.'),
                            $p('Fountain Pens', 'fountain-pens', 249, 10, 1000, 'A classic fountain pen with custom barrel printing or engraving.'),
                        ],
                    ],
                ],
            ],

            // 4. Rubber Stamps & Seals ---------------------------------------
            [
                'name' => 'Rubber Stamps & Seals',
                'slug' => 'rubber-stamps-seals',
                'blurb' => 'Self-inking and traditional rubber stamps, business seals, and paper embossers.',
                'subcategories' => [
                    [
                        'name' => 'Rubber Stamps', 'slug' => 'rubber-stamps',
                        'products' => [
                            $p('Self-Inking Stamps', 'self-inking-stamps', 249, 1, 500, 'A built-in ink pad stamp that re-inks itself with every press.'),
                            $p('Basic Rubber Stamps', 'basic-rubber-stamps', 129, 1, 500, 'A simple wood- or plastic-handle stamp for occasional use.'),
                            $p('Wooden Rubber Stamps', 'wooden-rubber-stamps', 149, 1, 500, 'A traditional wooden-handle stamp with a classic feel.'),
                            $p('Pocket Stamps', 'pocket-stamps', 199, 1, 500, 'A compact self-inking stamp small enough for a shirt pocket.'),
                            $p('Name Stamps', 'name-stamps', 149, 1, 500, 'A stamp of a name for signing off documents quickly.'),
                            $p('Address Stamps', 'address-stamps', 179, 1, 500, 'A return-address stamp for envelopes, packages and forms.'),
                            $p('Date Stamps', 'date-stamps', 299, 1, 200, 'An adjustable-date stamp for receiving and logging paperwork.'),
                            $p('Number Stamps', 'number-stamps', 299, 1, 200, 'An adjustable-number stamp for sequential document numbering.'),
                        ],
                    ],
                    [
                        'name' => 'Business Stamps', 'slug' => 'business-stamps',
                        'products' => [
                            $p('Company Seal', 'company-seal', 349, 1, 200, 'An official company seal stamp for registered business use.'),
                            $p('Proprietor Stamp', 'proprietor-stamp', 249, 1, 200, 'A designation stamp for sole proprietorship signing.'),
                            $p('Partner Stamp', 'partner-stamp', 249, 1, 200, 'A designation stamp for a named business partner.'),
                            $p('Director Stamp', 'director-stamp', 249, 1, 200, 'A designation stamp for a company director’s sign-off.'),
                            $p('Authorized Signatory Stamp', 'authorized-signatory-stamp', 249, 1, 200, 'A stamp marking a document as signed by an authorised signatory.'),
                            $p('GST Stamp', 'gst-stamp', 199, 1, 200, 'A stamp for marking invoices and paperwork with your GSTIN.'),
                            $p('Received Stamp', 'received-stamp', 149, 1, 200, 'A quick "Received" stamp for incoming paperwork and deliveries.'),
                            $p('Paid Stamp', 'paid-stamp', 149, 1, 200, 'A quick "Paid" stamp for marking settled invoices and bills.'),
                            $p('Approved Stamp', 'approved-stamp', 149, 1, 200, 'A quick "Approved" stamp for sign-off workflows.'),
                            $p('Checked Stamp', 'checked-stamp', 149, 1, 200, 'A quick "Checked" stamp for quality and audit sign-off.'),
                        ],
                    ],
                    [
                        'name' => 'Embossing', 'slug' => 'embossing',
                        'products' => [
                            $p('Paper Embosser', 'paper-embosser', 899, 1, 100, 'A handheld embosser that presses a raised design into paper.'),
                            $p('Logo Embosser', 'logo-embosser', 1099, 1, 100, 'An embosser custom-cut with your company logo.'),
                            $p('Seal Embosser', 'seal-embosser', 1199, 1, 100, 'A classic round embosser for an official notary-style seal.'),
                            $p('Certificate Embosser', 'certificate-embosser', 999, 1, 100, 'An embosser sized to authenticate certificates and formal documents.'),
                        ],
                    ],
                ],
            ],

            // 5. Flyers, Brochures & Marketing Materials ---------------------
            [
                'name' => 'Flyers, Brochures & Marketing Materials',
                'slug' => 'flyers-brochures-marketing',
                'blurb' => 'Flyers, brochures, booklets and promotional print for marketing, retail and events.',
                'subcategories' => [
                    [
                        'name' => 'Flyers', 'slug' => 'flyers',
                        'products' => [
                            $p('Single-Sided Flyers', 'single-sided-flyers', 349, 100, 20000, 'Crisp flyers printed on one side — great for handouts and drops.'),
                            $p('Double-Sided Flyers', 'double-sided-flyers', 449, 100, 20000, 'Flyers printed front and back to fit twice the message.'),
                            $p('A4 Flyers', 'a4-flyers', 549, 100, 20000, 'Full A4 flyers sized for posters, noticeboards and counters.'),
                            $p('A5 Flyers', 'a5-flyers', 399, 100, 20000, 'Compact A5 flyers, our most common handout size.'),
                            $p('A6 Flyers', 'a6-flyers', 299, 100, 20000, 'Pocket-size A6 flyers for quick promotional handouts.'),
                            $p('DL Flyers', 'dl-flyers', 349, 100, 20000, 'Slim DL flyers sized to fit standard envelopes and racks.'),
                            $p('Premium Flyers', 'premium-flyers', 649, 100, 10000, 'Heavier stock and a richer finish for a premium flyer.'),
                            $p('Bulk Flyers', 'bulk-flyers', 279, 500, 50000, 'Our lowest per-piece rate for large-quantity flyer drops.'),
                        ],
                    ],
                    [
                        'name' => 'Brochures', 'slug' => 'brochures',
                        'products' => [
                            $p('Bi-Fold Brochures', 'bi-fold-brochures', 899, 100, 10000, 'Sheets folded once for a clean, four-panel brochure.'),
                            $p('Tri-Fold Brochures', 'tri-fold-brochures', 999, 100, 10000, 'Six-panel tri-fold brochures for detailed product or service info.'),
                            $p('Z-Fold Brochures', 'z-fold-brochures', 999, 100, 10000, 'A zig-zag Z-fold layout that unfolds into one continuous panel.'),
                            $p('Gate-Fold Brochures', 'gate-fold-brochures', 1099, 100, 5000, 'Two panels that fold inward like gates to reveal a centre spread.'),
                            $p('Corporate Brochures', 'corporate-brochures', 1049, 100, 10000, 'A formal brochure format for company profiles and pitches.'),
                            $p('Product Brochures', 'product-brochures', 999, 100, 10000, 'A brochure format built around a product range or catalogue.'),
                            $p('Company Profile Brochures', 'company-profile-brochures', 1099, 100, 5000, 'A multi-panel brochure introducing your company to new clients.'),
                        ],
                    ],
                    [
                        'name' => 'Booklets', 'slug' => 'booklets',
                        'products' => [
                            $p('Product Booklets', 'product-booklets', 89, 50, 10000, 'A multi-page saddle-stitched booklet for a full product range.'),
                            $p('Company Profile Booklets', 'company-profile-booklets', 99, 50, 10000, 'A bound booklet introducing your company in more depth than a brochure.'),
                            $p('School Booklets', 'school-booklets', 79, 50, 10000, 'Booklets formatted for school newsletters, handbooks and events.'),
                            $p('Annual Reports', 'annual-reports', 149, 25, 5000, 'A formal bound report for shareholders, boards and stakeholders.'),
                            $p('Event Booklets', 'event-booklets', 89, 50, 5000, 'A programme booklet listing an event’s schedule and details.'),
                            $p('Catalogue Booklets', 'catalogue-booklets', 99, 50, 10000, 'A bound catalogue showcasing a full product or service range.'),
                            $p('Instruction Manuals', 'instruction-manuals', 79, 50, 10000, 'A step-by-step printed manual for a product or process.'),
                        ],
                    ],
                    [
                        'name' => 'Promotional Prints', 'slug' => 'promotional-prints',
                        'products' => [
                            $p('Postcards', 'postcards', 199, 100, 20000, 'Standard-size postcards for mailers, promos and event follow-ups.'),
                            $p('Bookmarks', 'bookmarks', 149, 100, 20000, 'Printed bookmarks — a small, low-cost promotional giveaway.'),
                            $p('Loyalty Cards', 'loyalty-cards-promo', 249, 100, 10000, 'Punch- or stamp-style loyalty cards to reward repeat customers.'),
                            $p('Gift Certificates', 'gift-certificates', 299, 100, 5000, 'Printed gift certificates redeemable in-store or online.'),
                            $p('Menu Cards', 'menu-cards', 449, 25, 2000, 'Single or multi-page menu cards for restaurants and cafes.'),
                            $p('Tent Cards', 'tent-cards', 199, 25, 5000, 'Fold-standing tent cards for counters, tables and displays.'),
                            $p('Table Cards', 'table-cards', 179, 25, 5000, 'Flat printed cards for table numbering or point-of-sale info.'),
                            $p('Door Hangers', 'door-hangers', 349, 100, 10000, 'Die-cut hangers that slip over a door handle for local marketing.'),
                            $p('Coupon Cards', 'coupon-cards', 249, 100, 10000, 'Tear-off or scannable coupon cards for promotions and discounts.'),
                        ],
                    ],
                ],
            ],

            // 6. Posters, Banners & Display Materials -------------------------
            [
                'name' => 'Posters, Banners & Display Materials',
                'slug' => 'posters-banners-display',
                'blurb' => 'Posters, flex and fabric banners, standees and rigid signboards for indoor and outdoor display.',
                'subcategories' => [
                    [
                        'name' => 'Posters', 'slug' => 'posters',
                        'products' => [
                            $p('Promotional Posters', 'promotional-posters', 149, 5, 5000, 'General-purpose posters for offers, launches and promotions.'),
                            $p('Event Posters', 'event-posters', 179, 5, 5000, 'Posters formatted for event dates, venues and lineups.'),
                            $p('Educational Posters', 'educational-posters', 149, 5, 5000, 'Posters for classrooms, training rooms and informational displays.'),
                            $p('Movie/Event Posters', 'movie-event-posters', 199, 5, 5000, 'Large-format posters for film, drama and entertainment events.'),
                            $p('Retail Posters', 'retail-posters', 149, 5, 5000, 'In-store posters for sales, new arrivals and seasonal promos.'),
                            $p('Safety Posters', 'safety-posters', 149, 5, 2000, 'Workplace safety posters for factories, sites and offices.'),
                            $p('Awareness Posters', 'awareness-posters', 149, 5, 2000, 'Public-awareness posters for campaigns and community drives.'),
                            $p('Bulk Posters', 'bulk-posters', 99, 50, 10000, 'Our lowest per-piece rate for large poster print runs.'),
                        ],
                    ],
                    [
                        'name' => 'Banners', 'slug' => 'banners',
                        'products' => [
                            $p('Flex Banners', 'flex-banners', 899, 1, 200, 'Weather-resistant flex banners for outdoor and indoor display.'),
                            $p('Vinyl Banners', 'vinyl-banners', 999, 1, 200, 'Durable printed vinyl banners for storefronts and events.'),
                            $p('Frontlit Flex', 'frontlit-flex', 899, 1, 200, 'Standard flex designed to be lit from the front.'),
                            $p('Backlit Flex', 'backlit-flex', 1499, 1, 100, 'Translucent flex designed for illuminated light boxes.'),
                            $p('Fabric Banners', 'fabric-banners', 1299, 1, 100, 'A soft, foldable fabric banner for indoor backdrops and stages.'),
                            $p('Mesh Banners', 'mesh-banners', 1199, 1, 200, 'Wind-permeable mesh banners built for large outdoor installs.'),
                            $p('Promotional Banners', 'promotional-banners', 899, 1, 200, 'General-purpose banners for offers, sales and announcements.'),
                            $p('Event Banners', 'event-banners', 949, 1, 200, 'Banners formatted for event branding, dates and sponsors.'),
                        ],
                    ],
                    [
                        'name' => 'Standee & Display', 'slug' => 'standee-display',
                        'products' => [
                            $p('Roll-Up Standees', 'roll-up-standees', 2499, 1, 100, 'A portable retractable standee with a carry bag — set up in seconds.'),
                            $p('X-Banners', 'x-banners', 1499, 1, 100, 'A lightweight X-frame banner stand for quick event setup.'),
                            $p('L-Banners', 'l-banners', 2999, 1, 100, 'A sturdier L-shaped standee frame for a stable floor display.'),
                            $p('Fabric Standees', 'fabric-standees', 3499, 1, 50, 'A tension-fabric standee frame for a premium, wrinkle-free look.'),
                            $p('Tabletop Standees', 'tabletop-standees', 1299, 1, 200, 'A compact standee for counters and reception desks.'),
                            $p('Tabletop Signs', 'tabletop-signs', 599, 1, 200, 'Small freestanding signs for menus, pricing and counter info.'),
                            $p('Acrylic Sign Holders', 'acrylic-sign-holders', 349, 1, 500, 'A clear acrylic holder for slotting in printed signage.'),
                            $p('QR Code Stands', 'qr-code-stands', 499, 1, 500, 'A small stand displaying a scannable QR code at checkout or entry.'),
                            $p('LED Display Stands', 'led-display-stands', 3999, 1, 50, 'A freestanding display with built-in LED edge lighting.'),
                            $p('Portable Backdrops', 'portable-backdrops', 4499, 1, 50, 'A collapsible backdrop frame for step-and-repeat event photography.'),
                            $p('Tension Fabric Displays', 'tension-fabric-displays', 4999, 1, 50, 'A large tension-fabric display wall for exhibitions and stages.'),
                        ],
                    ],
                    [
                        'name' => 'Boards & Signs', 'slug' => 'boards-signs',
                        'products' => [
                            $p('Foam Boards', 'foam-boards', 399, 1, 200, 'Lightweight foam board signage for indoor display and mounting.'),
                            $p('Sunboard Signs', 'sunboard-signs', 499, 1, 200, 'Rigid sunboard signage for indoor and light outdoor use.'),
                            $p('Acrylic Signs', 'acrylic-signs', 1299, 1, 100, 'Polished acrylic signage for a clean, modern look.'),
                            $p('PVC Signboards', 'pvc-signboards', 899, 1, 100, 'Weatherproof PVC boards for storefronts and outdoor signage.'),
                            $p('Plastic Signboards', 'plastic-signboards', 699, 1, 200, 'An economical plastic board for short-to-medium-term signage.'),
                            $p('ACP Boards', 'acp-boards', 1599, 1, 100, 'Aluminium composite panel boards for durable outdoor signage.'),
                            $p('Canvas Signs', 'canvas-signs', 999, 1, 100, 'Canvas-textured signage for a decorative, gallery-style look.'),
                            $p('Magnetic Signs', 'magnetic-signs', 799, 1, 200, 'Removable magnetic signs, popular for vehicle doors and panels.'),
                            $p('Outdoor Signs', 'outdoor-signs', 1199, 1, 100, 'Weather-rated signage built to withstand sun and rain.'),
                            $p('Indoor Signs', 'indoor-signs', 799, 1, 200, 'Signage designed for offices, retail and indoor wayfinding.'),
                            $p('LED Sign Boards', 'led-sign-boards', 3999, 1, 50, 'An illuminated LED signboard for storefronts and entrances.'),
                            $p('LED Translite Boards', 'led-translite-boards', 4499, 1, 50, 'A backlit translite panel for a bright, glowing display.'),
                            $p('LED Lollipop Displays', 'led-lollipop-displays', 2999, 1, 100, 'A small illuminated "lollipop" sign for counters and aisles.'),
                            $p('LED Clip-On Displays', 'led-clip-on-displays', 1999, 1, 100, 'A clip-mounted LED panel for shelves and fixtures.'),
                        ],
                    ],
                ],
            ],

            // 7. Corporate Branding Materials ---------------------------------
            [
                'name' => 'Corporate Branding Materials',
                'slug' => 'corporate-branding-materials',
                'blurb' => 'Office signage, event branding and vehicle branding to carry your identity everywhere.',
                'subcategories' => [
                    [
                        'name' => 'Office Branding', 'slug' => 'office-branding',
                        'products' => [
                            $p('Reception Boards', 'reception-boards', 2499, 1, 50, 'A branded sign for the reception or entrance wall.'),
                            $p('Office Name Boards', 'office-name-boards', 1499, 1, 100, 'A nameplate board for an office door or building entrance.'),
                            $p('Department Boards', 'department-boards', 899, 1, 200, 'Signage marking individual departments and rooms.'),
                            $p('Door Signs', 'door-signs', 349, 1, 500, 'Small signs for cabin, room and door identification.'),
                            $p('Wall Graphics', 'wall-graphics', 1999, 1, 100, 'Large-format printed graphics applied directly to office walls.'),
                            $p('Glass Branding', 'glass-branding', 1799, 1, 100, 'Printed vinyl branding applied to glass partitions and doors.'),
                            $p('Frosted Glass Film', 'frosted-glass-film', 1499, 1, 100, 'Frosted film for privacy on glass partitions, cut to your design.'),
                            $p('Safety Signs', 'safety-signs', 399, 1, 500, 'Workplace safety and hazard signage for compliance.'),
                            $p('Direction Signs', 'direction-signs', 449, 1, 500, 'Wayfinding signage for offices, sites and public spaces.'),
                            $p('Parking Signs', 'parking-signs', 599, 1, 500, 'Reserved and directional signage for parking areas.'),
                        ],
                    ],
                    [
                        'name' => 'Promotional Branding', 'slug' => 'promotional-branding',
                        'products' => [
                            $p('Promotional Tables', 'promotional-tables', 2999, 1, 50, 'A branded folding table for stalls, activations and roadshows.'),
                            $p('Event Table Covers', 'event-table-covers', 799, 1, 200, 'A fitted, branded cover for stall and booth tables.'),
                            $p('Event Table Runners', 'event-table-runners', 499, 1, 200, 'A branded strip runner for stall and reception tables.'),
                            $p('Branding Table Mats', 'branding-table-mats', 349, 1, 500, 'Printed mats for placing on booth and promotional tables.'),
                            $p('Branding Place Mats', 'branding-place-mats', 299, 10, 1000, 'Printed place mats for events, expos and product demos.'),
                            $p('Promotional Canopies', 'promotional-canopies', 8999, 1, 50, 'A branded pop-up canopy tent for outdoor stalls and events.'),
                            $p('Logo Flags', 'logo-flags', 1499, 1, 200, 'A branded flag flown outside a store, office or event.'),
                            $p('Sail Flags', 'sail-flags', 1999, 1, 100, 'A tall, curved sail-shaped flag for high-visibility branding.'),
                            $p('Feather Flags', 'feather-flags', 1799, 1, 100, 'A feather-shaped flag that moves with the wind for extra visibility.'),
                            $p('Pole Flags', 'pole-flags', 1299, 1, 200, 'A rectangular flag mounted on a pole for storefronts and events.'),
                        ],
                    ],
                    [
                        'name' => 'Vehicle Branding', 'slug' => 'vehicle-branding',
                        'products' => [
                            $p('Car Branding Stickers', 'car-branding-stickers', 999, 1, 100, 'Printed vinyl stickers for partial car branding and logos.'),
                            $p('Car Door Decals', 'car-door-decals', 799, 1, 100, 'Branded decals sized for car door panels.'),
                            $p('Full Car Branding', 'full-car-branding', 8999, 1, 50, 'Full-body vehicle wrap graphics for complete car branding.'),
                            $p('Auto Rickshaw Branding', 'auto-rickshaw-branding', 2999, 1, 100, 'Branding graphics sized and cut for auto-rickshaw panels.'),
                            $p('Bus Branding', 'bus-branding', 15999, 1, 20, 'Large-format branding graphics for bus exteriors.'),
                            $p('Commercial Vehicle Branding', 'commercial-vehicle-branding', 6999, 1, 50, 'Branding graphics for vans, trucks and commercial fleets.'),
                            $p('Magnetic Vehicle Signs', 'magnetic-vehicle-signs', 1299, 1, 100, 'Removable magnetic signage for vehicle doors and panels.'),
                        ],
                    ],
                ],
            ],

            // 8. Stickers & Labels --------------------------------------------
            [
                'name' => 'Stickers & Labels',
                'slug' => 'stickers-labels',
                'blurb' => 'Die-cut stickers, sheet and roll labels, and product labelling for retail and packaging.',
                'subcategories' => [
                    [
                        'name' => 'Custom Stickers', 'slug' => 'custom-stickers',
                        'products' => [
                            $p('Sheet Stickers', 'sheet-stickers', 149, 10, 10000, 'Multiple stickers laid out on a single sheet for easy peeling.'),
                            $p('Individual Stickers', 'individual-stickers', 99, 100, 50000, 'Single stickers cut and supplied one at a time.'),
                            $p('Custom Shape Stickers', 'custom-shape-stickers', 199, 100, 20000, 'Stickers cut precisely to your own custom outline.'),
                            $p('Round Stickers', 'round-stickers', 149, 100, 20000, 'Classic circular stickers for labels, seals and branding.'),
                            $p('Square Stickers', 'square-stickers', 149, 100, 20000, 'Square-cut stickers for labels, packaging and branding.'),
                            $p('Die-Cut Stickers', 'custom-die-cut-stickers-sheet', 199, 50, 20000, 'Stickers cut precisely to your custom shape and design.'),
                            $p('UV Transfer Stickers', 'uv-transfer-stickers', 249, 100, 10000, 'A raised, glossy UV coating transferred onto a clear or coloured base.'),
                            $p('Window Stickers', 'window-stickers', 349, 10, 5000, 'Stickers designed to apply to glass storefronts and windows.'),
                            $p('Dome Stickers', 'dome-stickers', 399, 50, 5000, 'A resin dome coating that gives stickers a raised, glossy 3D look.'),
                            $p('QR Code Stickers', 'qr-code-stickers', 149, 100, 20000, 'Stickers printed with a scannable QR code.'),
                            $p('Car Stickers', 'car-stickers', 149, 25, 5000, 'Decorative or branded stickers sized for car body panels.'),
                            $p('Visiting Card Stickers', 'visiting-card-stickers', 199, 100, 10000, 'Business-card-sized stickers for sealing packages and mailers.'),
                            $p('Kraft Stickers', 'kraft-stickers', 199, 100, 10000, 'Natural kraft-finish stickers for an artisanal, eco look.'),
                            $p('Holographic Stickers', 'holographic-stickers', 349, 50, 10000, 'Eye-catching holographic-finish stickers cut to shape.'),
                            $p('Metal Stickers', 'metal-stickers', 449, 25, 5000, 'A metallic-foil sticker finish for a premium, reflective look.'),
                            $p('Transparent Stickers', 'transparent-stickers', 249, 50, 10000, 'Clear stickers that show the surface through the un-printed areas.'),
                        ],
                    ],
                    [
                        'name' => 'Product Labels', 'slug' => 'product-labels',
                        'products' => [
                            $p('Product Labels', 'product-labels-general', 149, 100, 50000, 'General-purpose adhesive labels for products and packaging.'),
                            $p('Packaging Labels', 'packaging-labels', 149, 100, 50000, 'Labels sized and finished for outer packaging and cartons.'),
                            $p('Barcode Labels', 'barcode-labels', 129, 100, 50000, 'Pre-sized barcode labels for retail and inventory.'),
                            $p('QR Labels', 'qr-labels', 129, 100, 50000, 'Adhesive labels printed with a scannable QR code.'),
                            $p('Shipping Labels', 'shipping-labels', 149, 100, 50000, 'Durable labels for shipping cartons and parcels.'),
                            $p('Mailing Labels', 'mailing-labels', 129, 100, 50000, 'Address labels for envelopes, mailers and parcels.'),
                            $p('Return Address Labels', 'return-address-labels', 99, 100, 50000, 'Small return-address labels for envelopes and packages.'),
                            $p('Industrial Labels', 'industrial-labels', 249, 100, 20000, 'Heavy-duty labels built for factory and warehouse conditions.'),
                            $p('Transparent Labels', 'transparent-labels-product', 199, 100, 20000, 'Clear adhesive labels for a seamless, no-label look on packaging.'),
                            $p('Waterproof Labels', 'waterproof-labels', 249, 100, 20000, 'Water- and smudge-resistant labels for bottles and outdoor use.'),
                            $p('Roll Labels', 'roll-labels', 499, 1, 500, 'Continuous roll labels for dispenser-fed applying.'),
                            $p('Food Labels', 'food-labels', 149, 100, 50000, 'Food-safe adhesive labels for packaging and containers.'),
                            $p('Cosmetic Labels', 'cosmetic-labels', 199, 100, 50000, 'Labels sized and finished for cosmetic and skincare packaging.'),
                            $p('Pharmaceutical Labels', 'pharmaceutical-labels', 249, 100, 50000, 'Precision labels formatted for pharmaceutical and medical packaging.'),
                        ],
                    ],
                ],
            ],

            // 9. Packaging & Bags -----------------------------------------------
            [
                'name' => 'Packaging & Bags',
                'slug' => 'packaging-bags',
                'blurb' => 'Paper bags, carry bags, courier bags and packaging boxes for retail and e-commerce.',
                'subcategories' => [
                    [
                        'name' => 'Paper Bags', 'slug' => 'paper-bags',
                        'products' => [
                            $p('Printed Paper Bags', 'printed-paper-bags', 12, 100, 20000, 'Paper carry bags printed with your logo and branding.'),
                            $p('Custom Paper Bags', 'custom-paper-bags', 15, 100, 20000, 'Fully custom-sized paper bags built to your brief.'),
                            $p('Kraft Paper Bags', 'kraft-paper-bags', 12, 100, 20000, 'Recyclable kraft paper bags for retail checkout.'),
                            $p('Premium Gift Bags', 'premium-gift-bags', 29, 50, 10000, 'A sturdier bag with a premium look, built for gifting.'),
                            $p('Designer Shopping Bags', 'designer-shopping-bags', 35, 50, 10000, 'A styled shopping bag designed to reflect your brand.'),
                            $p('Luxury Shopping Bags', 'luxury-shopping-bags', 59, 25, 5000, 'Our top-tier shopping bag — heavier stock, rope handles, refined print.'),
                            $p('Metallic Shopping Bags', 'metallic-shopping-bags', 49, 50, 5000, 'A metallic-finish bag for a bold, premium retail look.'),
                            $p('Die-Cut Handle Bags', 'die-cut-handle-bags', 18, 100, 20000, 'Bags with a built-in die-cut handle, no separate handle needed.'),
                            $p('Full-Print Paper Bags', 'full-print-paper-bags', 25, 100, 10000, 'Edge-to-edge full-colour printing across the entire bag.'),
                        ],
                    ],
                    [
                        'name' => 'Carry Bags', 'slug' => 'carry-bags',
                        'products' => [
                            $p('Printed Carry Bags', 'printed-carry-bags', 10, 100, 20000, 'General-purpose carry bags printed with your branding.'),
                            $p('Non-Woven Bags', 'non-woven-bags', 14, 100, 20000, 'Reusable non-woven fabric bags, a durable retail staple.'),
                            $p('Cloth Bags', 'cloth-bags', 22, 50, 10000, 'Simple printed cloth bags for reusable retail carry.'),
                            $p('Jute Bags', 'jute-bags', 39, 50, 5000, 'Natural jute-fibre bags for an eco-friendly, rustic look.'),
                            $p('Cotton Bags', 'cotton-bags', 29, 50, 10000, 'Sturdy printed cotton bags for reusable retail and gifting.'),
                            $p('Canvas Bags', 'canvas-bags', 45, 25, 5000, 'Heavy-duty canvas bags built for repeated everyday use.'),
                        ],
                    ],
                    [
                        'name' => 'Courier & Shipping', 'slug' => 'courier-shipping',
                        'products' => [
                            $p('Courier Bags', 'courier-bags', 4, 100, 50000, 'Standard courier bags for e-commerce shipping.'),
                            $p('Printed Courier Bags', 'printed-courier-bags', 5, 100, 50000, 'Courier bags printed with your brand and return details.'),
                            $p('Self-Seal Courier Bags', 'self-seal-courier-bags', 4, 100, 50000, 'Security-sealed courier bags for safe, tamper-evident shipping.'),
                            $p('Transparent Seal Bags', 'transparent-seal-bags', 5, 100, 50000, 'Clear self-seal bags for visible-contents shipping.'),
                            $p('Frosted Zipper Bags', 'frosted-zipper-bags', 6, 100, 20000, 'Resealable frosted zipper bags for small item packaging.'),
                        ],
                    ],
                    [
                        'name' => 'Packaging Boxes', 'slug' => 'packaging-boxes',
                        'products' => [
                            $p('Corrugated Boxes', 'corrugated-boxes', 19, 50, 10000, 'Sturdy corrugated shipping boxes printed with your branding.'),
                            $p('Mailer Boxes', 'mailer-boxes', 22, 50, 10000, 'Fold-flat mailer boxes sized for online orders and returns.'),
                            $p('Flat Mailer Boxes', 'flat-mailer-boxes', 18, 50, 10000, 'A slim, flat-pack mailer box for lightweight items.'),
                            $p('Tuck Top Boxes', 'tuck-top-boxes', 18, 50, 10000, 'Simple tuck-top boxes for lightweight retail packaging.'),
                            $p('Lock Bottom Boxes', 'lock-bottom-boxes', 22, 50, 10000, 'A self-locking base box for a sturdier pack-and-ship option.'),
                            $p('Auto Lock Boxes', 'auto-lock-boxes', 25, 50, 10000, 'A box that folds and locks into shape without glue or tape.'),
                            $p('Product Boxes', 'product-boxes', 20, 50, 10000, 'General-purpose retail packaging boxes for any product.'),
                            $p('Promotional Product Boxes', 'promotional-product-boxes', 29, 50, 5000, 'A branded box designed for launches and promotional bundles.'),
                            $p('Chocolate Boxes', 'chocolate-boxes', 15, 50, 10000, 'Compartmented boxes sized for chocolates and confectionery.'),
                            $p('Soap Boxes', 'soap-boxes', 10, 100, 20000, 'Compact boxes sized for bar soap and small toiletries.'),
                            $p('Burger Boxes', 'burger-boxes', 6, 100, 20000, 'Food-grade boxes sized for burgers and quick-service food.'),
                            $p('Popcorn Boxes', 'popcorn-boxes', 5, 100, 20000, 'Food-grade boxes sized for popcorn and snack concessions.'),
                            $p('Pull-Out Boxes', 'pull-out-boxes', 25, 50, 5000, 'A drawer-style box that slides open from an outer sleeve.'),
                        ],
                    ],
                    [
                        'name' => 'Packaging Accessories', 'slug' => 'packaging-accessories',
                        'products' => [
                            $p('Printed Tapes', 'printed-tapes', 79, 10, 2000, 'Branded packing tape for sealing parcels and cartons.'),
                            $p('Self-Adhesive Tapes', 'self-adhesive-tapes', 59, 10, 2000, 'Plain self-adhesive packing tape for everyday shipping.'),
                            $p('Custom Ribbons', 'custom-ribbons', 99, 10, 1000, 'Branded ribbon for gift wrapping and packaging finishing touches.'),
                            $p('Packaging Stickers', 'packaging-stickers', 129, 100, 20000, 'Small stickers used to seal, brand or decorate packaging.'),
                            $p('Seals', 'seals', 89, 100, 10000, 'Tamper-evident seal stickers for boxes and packaging.'),
                            $p('Thank You Insert Cards', 'thank-you-insert-cards', 199, 100, 10000, 'A small branded thank-you card tucked into every package.'),
                            $p('Packaging Product Tags', 'packaging-product-tags', 149, 100, 10000, 'Small tags attached to a product before it’s packed and shipped.'),
                        ],
                    ],
                ],
            ],

            // 10. Tags & Cards ---------------------------------------------------
            [
                'name' => 'Tags & Cards',
                'slug' => 'tags-cards',
                'blurb' => 'Hang tags, price tags and retail cards for clothing, jewellery and loyalty programmes.',
                'subcategories' => [
                    [
                        'name' => 'Tags', 'slug' => 'tags',
                        'products' => [
                            $p('Hang Tags', 'hang-tags', 149, 100, 20000, 'Standard hang tags for attaching to retail products.'),
                            $p('Folded Hang Tags', 'folded-hang-tags', 179, 100, 10000, 'A folded two-sided tag with more room for product details.'),
                            $p('Clothing Tags', 'clothing-tags', 149, 100, 20000, 'Tags sized and punched for garments and apparel.'),
                            $p('Product Tags', 'product-tags', 149, 100, 20000, 'General-purpose tags for any product line.'),
                            $p('Price Tags', 'price-tags', 99, 100, 20000, 'Simple tags formatted for pricing and SKU information.'),
                            $p('Baggage Tags', 'baggage-tags', 149, 100, 10000, 'Durable tags for luggage, travel and delivery use.'),
                            $p('Name Tags', 'name-tags-retail', 129, 100, 10000, 'Small printed tags for staff or product names.'),
                            $p('Jewellery Tags', 'jewellery-tags', 179, 100, 10000, 'Small precision tags sized for jewellery and accessories.'),
                            $p('Raised Foil Hang Tags', 'raised-foil-hang-tags', 349, 50, 5000, 'Hang tags finished with a raised metallic foil stamp.'),
                        ],
                    ],
                    [
                        'name' => 'Retail Cards', 'slug' => 'retail-cards',
                        'products' => [
                            $p('Loyalty Cards', 'loyalty-cards-retail', 249, 100, 10000, 'Punch- or stamp-style cards to reward repeat customers.'),
                            $p('Membership Cards', 'membership-cards', 349, 50, 5000, 'PVC or paper membership cards for clubs and programmes.'),
                            $p('Discount Cards', 'discount-cards', 249, 100, 10000, 'Cards printed with a discount code or percentage-off offer.'),
                            $p('Gift Cards', 'gift-cards-retail', 349, 50, 5000, 'Printed gift cards ready for a value to be added at point of sale.'),
                            $p('Warranty Cards', 'warranty-cards', 199, 100, 10000, 'Cards documenting a product’s warranty terms and coverage.'),
                            $p('Customer Thank You Cards', 'customer-thank-you-cards', 199, 100, 10000, 'A small branded thank-you card to include with a customer’s order.'),
                            $p('Appointment Cards', 'appointment-cards', 199, 100, 10000, 'Cards for noting a customer’s next booking or appointment.'),
                        ],
                    ],
                ],
            ],

            // 18. Calendars ---------------------------------------------------
            [
                'name' => 'Calendars',
                'slug' => 'calendars',
                'blurb' => 'Wall, desk and photo calendars for corporate gifting and everyday office use.',
                'subcategories' => [
                    [
                        'name' => 'Calendars', 'slug' => 'calendars-all',
                        'products' => [
                            $p('Wall Calendars', 'wall-calendars', 149, 25, 5000, 'A classic hanging wall calendar for home and office.'),
                            $p('Desk Calendars', 'desk-calendars', 129, 25, 5000, 'A compact standing calendar for desks and counters.'),
                            $p('Spiral Desk Calendars', 'spiral-desk-calendars', 149, 25, 5000, 'A wire-bound desk calendar that flips flat month to month.'),
                            $p('Poster Calendars', 'poster-calendars', 179, 25, 2000, 'A single large-format calendar printed poster-style.'),
                            $p('Flip Calendars', 'flip-calendars', 149, 25, 2000, 'A page-a-month flip calendar for desks and walls.'),
                            $p('Magnetic Calendars', 'magnetic-calendars', 99, 50, 5000, 'A small magnetic calendar for fridges and metal surfaces.'),
                            $p('Perpetual Calendars', 'perpetual-calendars', 249, 10, 1000, 'A reusable, year-agnostic calendar for a permanent desk display.'),
                            $p('Photo Calendars', 'photo-calendars', 299, 10, 2000, 'A calendar built around your own photos, month by month.'),
                            $p('Corporate Calendars', 'corporate-calendars', 199, 25, 5000, 'A branded calendar designed for year-end corporate gifting.'),
                            $p('Four-Sheet Calendars', 'four-sheet-calendars', 179, 25, 2000, 'A four-panel calendar showing three months per sheet.'),
                            $p('Desk Calendar with Photo Frame', 'desk-calendar-with-photo-frame', 349, 10, 1000, 'A standing desk calendar built around a small photo frame.'),
                        ],
                    ],
                ],
            ],

            // 19. Coasters & Table Products -------------------------------------
            [
                'name' => 'Coasters & Table Products',
                'slug' => 'coasters-table-products',
                'blurb' => 'Custom coasters, table mats and dining accessories for cafes, restaurants and homes.',
                'subcategories' => [
                    [
                        'name' => 'Coasters', 'slug' => 'coasters',
                        'products' => [
                            $p('Paper Coasters', 'paper-coasters', 99, 25, 5000, 'Absorbent printed paper coasters for cafes and bars.'),
                            $p('MDF Coasters', 'mdf-coasters', 149, 10, 2000, 'A sturdy wooden MDF coaster with a printed top surface.'),
                            $p('Acrylic Coasters', 'acrylic-coasters', 179, 10, 2000, 'A glossy acrylic coaster for a modern, polished look.'),
                            $p('Wooden Coasters', 'wooden-coasters', 169, 10, 2000, 'A natural wood coaster, engraved or printed with your design.'),
                            $p('Soft Coasters', 'soft-coasters', 89, 25, 5000, 'A flexible fabric-topped coaster for everyday home and cafe use.'),
                            $p('Custom Printed Coasters', 'custom-printed-coasters', 119, 25, 5000, 'A coaster printed edge-to-edge with your own design.'),
                        ],
                    ],
                    [
                        'name' => 'Table Products', 'slug' => 'table-products',
                        'products' => [
                            $p('Table Mats', 'table-mats', 249, 10, 2000, 'Printed dining table mats for cafes, restaurants and homes.'),
                            $p('Place Mats', 'place-mats', 229, 10, 2000, 'Individual place setting mats for dining tables.'),
                            $p('Table Runners', 'table-runners', 349, 5, 1000, 'A decorative runner laid along the centre of a dining table.'),
                            $p('Table Covers', 'table-covers', 449, 5, 500, 'A fitted or draped cover for dining and event tables.'),
                            $p('Printed Tablecloths', 'printed-tablecloths', 599, 5, 500, 'A full tablecloth printed with your design or branding.'),
                            $p('Menu Holders', 'menu-holders', 199, 10, 1000, 'A stand or sleeve for displaying a restaurant menu at the table.'),
                            $p('Tabletop QR Stands', 'tabletop-qr-stands', 149, 10, 1000, 'A small table stand displaying a scannable QR code menu or offer.'),
                            $p('Table Tent Cards', 'table-tent-cards', 179, 25, 5000, 'A fold-standing tent card for tabletop promotions and menus.'),
                        ],
                    ],
                ],
            ],
        ];
    }
}
