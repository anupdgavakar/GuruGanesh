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
 * Seeds the full GuruGanesh Graphics catalog: every category and
 * subcategory the storefront's mega menu (web/src/components/layout/
 * category-nav.tsx), homepage category tiles (category-grid.tsx) and
 * /products catalog index are built around, plus real products under each
 * subcategory so every page has something to show.
 *
 * The six top-level category names/slugs here are load-bearing — the
 * homepage and catalog tiles pick a realistic photo per category by
 * matching keywords against the category name (see
 * web/src/lib/category-images.ts), so renaming a category here means
 * updating that file too.
 *
 * Must run AFTER DatabaseSeeder has created the design modes, delivery
 * options, product types and pricing tiers below — this seeder assigns
 * products to whichever of those already exist, cycling through them so
 * every lookup value is actually used somewhere in the catalog.
 */
class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $designModeIds = ProductDesignMode::pluck('id')->all();
        $deliveryOptionIds = ProductDeliveryOption::pluck('id')->all();
        $productTypeIds = ProductType::pluck('id')->all();
        $pricingTierIds = ProductPricingTier::pluck('id')->all();

        // A hand-picked spread across categories for the homepage's
        // "Featured products" rail (getFeaturedProducts()) and the
        // is_featured badge on product cards.
        $featuredSlugs = [
            'classic-matte-business-cards',
            'a4-bi-fold-brochures',
            'premium-rigid-gift-boxes',
            'custom-printed-shipping-boxes',
            'vinyl-flex-banners',
            'retractable-roll-up-standee',
            'custom-die-cut-stickers',
            'round-neck-t-shirt',
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
            [
                'name' => 'Business Cards',
                'slug' => 'business-cards',
                'blurb' => 'Custom business card printing in matte, glossy, textured, foil and metal finishes.',
                'subcategories' => [
                    [
                        'name' => 'Standard Business Cards', 'slug' => 'standard-business-cards',
                        'products' => [
                            $p('Classic Matte Business Cards', 'classic-matte-business-cards', 249, 100, 10000, 'Smooth matte-finish cards on 300gsm stock — our most popular everyday business card.'),
                            $p('Classic Glossy Business Cards', 'classic-glossy-business-cards', 279, 100, 10000, 'High-shine glossy cards that make colours and logos pop.'),
                            $p('Recycled Kraft Business Cards', 'recycled-kraft-business-cards', 329, 100, 5000, 'Eco-friendly kraft-stock cards with a natural, textured look.'),
                        ],
                    ],
                    [
                        'name' => 'Premium Business Cards', 'slug' => 'premium-business-cards',
                        'products' => [
                            $p('Textured Cotton Business Cards', 'textured-cotton-business-cards', 599, 100, 5000, '100% cotton stock with a soft, tactile texture that signals quality.'),
                            $p('Spot-UV Business Cards', 'spot-uv-business-cards', 699, 100, 5000, 'Matte base with a glossy raised UV coating on your logo or text.'),
                            $p('Letterpress Business Cards', 'letterpress-business-cards', 899, 100, 2500, 'Deep-pressed letterpress printing on thick cotton stock.'),
                        ],
                    ],
                    [
                        'name' => 'Metal & Foil Business Cards', 'slug' => 'metal-foil-business-cards',
                        'products' => [
                            $p('Gold Foil Business Cards', 'gold-foil-business-cards', 1299, 50, 2500, 'Metallic gold foil stamping on premium matte card stock.'),
                            $p('Silver Foil Business Cards', 'silver-foil-business-cards', 1299, 50, 2500, 'Metallic silver foil stamping on premium matte card stock.'),
                            $p('Brushed Metal Business Cards', 'brushed-metal-business-cards', 2499, 25, 1000, 'Laser-etched stainless steel cards for a striking, durable card.'),
                        ],
                    ],
                    [
                        'name' => 'Square Business Cards', 'slug' => 'square-business-cards',
                        'products' => [
                            $p('Matte Square Business Cards', 'matte-square-business-cards', 349, 100, 5000, 'A distinctive square format with a smooth matte finish.'),
                            $p('Rounded-Corner Square Cards', 'rounded-corner-square-cards', 399, 100, 5000, 'Square cards with softened corners for a modern feel.'),
                            $p('Glossy Square Business Cards', 'glossy-square-business-cards', 349, 100, 5000, 'Square format with a vibrant, high-shine glossy coating.'),
                        ],
                    ],
                    [
                        'name' => 'Loyalty & Membership Cards', 'slug' => 'loyalty-membership-cards',
                        'products' => [
                            $p('Punch-Card Loyalty Cards', 'punch-card-loyalty-cards', 399, 100, 5000, 'Simple punch-style loyalty cards to reward repeat customers.'),
                            $p('PVC Membership Cards', 'pvc-membership-cards', 899, 50, 5000, 'Durable plastic PVC cards, ideal for membership or ID use.'),
                            $p('Scratch-Off Loyalty Cards', 'scratch-off-loyalty-cards', 599, 100, 5000, 'Loyalty cards with a scratch-off panel for reveal-and-reward promos.'),
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Flyers & Brochures',
                'slug' => 'flyers-brochures',
                'blurb' => 'Flyers, brochures, leaflets and menu cards for marketing, events and in-store use.',
                'subcategories' => [
                    [
                        'name' => 'Flyers', 'slug' => 'flyers',
                        'products' => [
                            $p('A5 Single-Sided Flyers', 'a5-single-sided-flyers', 399, 100, 20000, 'Crisp A5 flyers printed on one side — great for handouts and drops.'),
                            $p('A5 Double-Sided Flyers', 'a5-double-sided-flyers', 499, 100, 20000, 'A5 flyers printed front and back to fit twice the message.'),
                            $p('A4 Event Flyers', 'a4-event-flyers', 599, 100, 20000, 'Bold A4 flyers sized for posters, noticeboards and events.'),
                        ],
                    ],
                    [
                        'name' => 'Bi-Fold Brochures', 'slug' => 'bi-fold-brochures',
                        'products' => [
                            $p('A4 Bi-Fold Brochures', 'a4-bi-fold-brochures', 899, 100, 10000, 'A4 sheets folded once for a clean, four-panel brochure.'),
                            $p('DL Bi-Fold Brochures', 'dl-bi-fold-brochures', 799, 100, 10000, 'Compact DL-size bi-fold brochures, ideal for counters and mailers.'),
                            $p('Matte Bi-Fold Brochures', 'matte-bi-fold-brochures', 949, 100, 10000, 'Bi-fold brochures on a soft-touch matte stock.'),
                        ],
                    ],
                    [
                        'name' => 'Tri-Fold Brochures', 'slug' => 'tri-fold-brochures',
                        'products' => [
                            $p('A4 Tri-Fold Brochures', 'a4-tri-fold-brochures', 999, 100, 10000, 'Six-panel A4 tri-fold brochures for detailed product or service info.'),
                            $p('DL Tri-Fold Brochures', 'dl-tri-fold-brochures', 899, 100, 10000, 'Slim DL tri-fold brochures that fit standard envelopes.'),
                            $p('Glossy Tri-Fold Brochures', 'glossy-tri-fold-brochures', 1049, 100, 10000, 'Tri-fold brochures with a vibrant glossy finish.'),
                        ],
                    ],
                    [
                        'name' => 'Leaflets', 'slug' => 'leaflets',
                        'products' => [
                            $p('A6 Promotional Leaflets', 'a6-promotional-leaflets', 349, 100, 20000, 'Pocket-size A6 leaflets for quick promotional handouts.'),
                            $p('A5 Product Leaflets', 'a5-product-leaflets', 449, 100, 20000, 'A5 leaflets sized for product details and price lists.'),
                            $p('DL Insert Leaflets', 'dl-insert-leaflets', 399, 100, 20000, 'Slim DL leaflets designed to slip into envelopes and packs.'),
                        ],
                    ],
                    [
                        'name' => 'Menu Cards', 'slug' => 'menu-cards',
                        'products' => [
                            $p('Laminated Restaurant Menus', 'laminated-restaurant-menus', 1199, 25, 2000, 'Wipe-clean laminated menus built for daily restaurant use.'),
                            $p('Tri-Fold Cafe Menus', 'tri-fold-cafe-menus', 999, 25, 2000, 'Compact tri-fold menus suited to cafes and small eateries.'),
                            $p('Single-Page Takeaway Menus', 'single-page-takeaway-menus', 599, 50, 5000, 'Simple single-page menus for takeaway counters and delivery bags.'),
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Packaging',
                'slug' => 'packaging',
                'blurb' => 'Custom boxes, bags and mailers for retail, e-commerce and gifting.',
                'subcategories' => [
                    [
                        'name' => 'Corrugated Boxes', 'slug' => 'corrugated-boxes',
                        'products' => [
                            $p('Custom Printed Shipping Boxes', 'custom-printed-shipping-boxes', 19, 50, 10000, 'Sturdy corrugated shipping boxes printed with your branding.'),
                            $p('Branded Corrugated Mailer Boxes', 'branded-corrugated-mailer-boxes', 29, 50, 10000, 'Corrugated mailer boxes that double as branded unboxing packaging.'),
                            $p('Heavy-Duty Export Boxes', 'heavy-duty-export-boxes', 39, 25, 5000, 'Extra-strength corrugated boxes built for export and bulk shipping.'),
                        ],
                    ],
                    [
                        'name' => 'Rigid Boxes', 'slug' => 'rigid-boxes',
                        'products' => [
                            $p('Premium Rigid Gift Boxes', 'premium-rigid-gift-boxes', 149, 25, 5000, 'Sturdy rigid boxes with a premium look for gifting and retail.'),
                            $p('Magnetic-Flap Rigid Boxes', 'magnetic-flap-rigid-boxes', 199, 25, 5000, 'Rigid boxes with a magnetic closure for a luxury unboxing feel.'),
                            $p('Rigid Jewellery Boxes', 'rigid-jewellery-boxes', 99, 25, 5000, 'Small rigid boxes sized and lined for jewellery and accessories.'),
                        ],
                    ],
                    [
                        'name' => 'Kraft Bags', 'slug' => 'kraft-bags',
                        'products' => [
                            $p('Kraft Paper Carry Bags', 'kraft-paper-carry-bags', 12, 100, 20000, 'Recyclable kraft paper carry bags for retail checkout.'),
                            $p('Printed Kraft Grocery Bags', 'printed-kraft-grocery-bags', 15, 100, 20000, 'Sturdy kraft grocery bags printed with your store branding.'),
                            $p('Kraft Bags with Rope Handles', 'kraft-bags-with-rope-handles', 18, 100, 10000, 'Kraft bags finished with sturdy rope handles for a premium feel.'),
                        ],
                    ],
                    [
                        'name' => 'Mailer Boxes', 'slug' => 'mailer-boxes',
                        'products' => [
                            $p('E-Commerce Mailer Boxes', 'ecommerce-mailer-boxes', 22, 50, 10000, 'Fold-flat mailer boxes sized for online orders and returns.'),
                            $p('Tuck-Top Mailer Boxes', 'tuck-top-mailer-boxes', 18, 50, 10000, 'Simple tuck-top mailer boxes for lightweight shipments.'),
                            $p('Two-Piece Mailer Boxes', 'two-piece-mailer-boxes', 25, 50, 10000, 'Lid-and-base mailer boxes for a sturdier unboxing experience.'),
                        ],
                    ],
                    [
                        'name' => 'Courier & Poly Bags', 'slug' => 'courier-poly-bags',
                        'products' => [
                            $p('Tamper-Proof Courier Bags', 'tamper-proof-courier-bags', 4, 100, 50000, 'Security-sealed courier bags for safe, tamper-evident shipping.'),
                            $p('Branded Poly Mailers', 'branded-poly-mailers', 5, 100, 50000, 'Lightweight, water-resistant poly mailers printed with your logo.'),
                            $p('Bubble Courier Bags', 'bubble-courier-bags', 8, 100, 20000, 'Padded bubble-lined courier bags for fragile items.'),
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Signage & Banners',
                'slug' => 'signage-banners',
                'blurb' => 'Flex banners, standees, sunboard, acrylic and vehicle signage.',
                'subcategories' => [
                    [
                        'name' => 'Flex Banners', 'slug' => 'flex-banners',
                        'products' => [
                            $p('Vinyl Flex Banners', 'vinyl-flex-banners', 899, 1, 200, 'Weather-resistant vinyl flex banners for outdoor and indoor display.'),
                            $p('Mesh Flex Banners', 'mesh-flex-banners', 1199, 1, 200, 'Wind-permeable mesh banners built for large outdoor installs.'),
                            $p('Backlit Flex Banners', 'backlit-flex-banners', 1499, 1, 100, 'Translucent flex banners designed for illuminated light boxes.'),
                        ],
                    ],
                    [
                        'name' => 'Roll-Up Standees', 'slug' => 'roll-up-standees',
                        'products' => [
                            $p('Retractable Roll-Up Standee', 'retractable-roll-up-standee', 2499, 1, 100, 'Portable retractable standee with a carry bag — set up in seconds.'),
                            $p('Premium L-Banner Standee', 'premium-l-banner-standee', 2999, 1, 100, 'Sturdy L-shaped standee frame for a sturdier floor display.'),
                            $p('Mini Tabletop Standee', 'mini-tabletop-standee', 1299, 1, 200, 'Compact tabletop standee for counters and reception desks.'),
                        ],
                    ],
                    [
                        'name' => 'Sunboard Signs', 'slug' => 'sunboard-signs',
                        'products' => [
                            $p('Sunboard Signage — 3mm', 'sunboard-signage-3mm', 499, 1, 200, 'Lightweight 3mm sunboard signage for indoor display.'),
                            $p('Sunboard Signage — 5mm', 'sunboard-signage-5mm', 699, 1, 200, 'Rigid 5mm sunboard signage for a sturdier board.'),
                            $p('Cut-Out Letter Sunboard Signs', 'cut-out-letter-sunboard-signs', 1299, 1, 100, 'Custom die-cut letter signage mounted on sunboard.'),
                        ],
                    ],
                    [
                        'name' => 'Acrylic Signs', 'slug' => 'acrylic-signs',
                        'products' => [
                            $p('LED Acrylic Signboard', 'led-acrylic-signboard', 3499, 1, 50, 'Illuminated acrylic signboard with built-in LED backlighting.'),
                            $p('Clear Acrylic Nameplate', 'clear-acrylic-nameplate', 899, 1, 200, 'Polished clear acrylic nameplate for desks and doors.'),
                            $p('3D Acrylic Letters', 'acrylic-letters-3d', 4999, 1, 50, 'Raised 3D acrylic letters for storefronts and receptions.'),
                        ],
                    ],
                    [
                        'name' => 'Vehicle & Window Graphics', 'slug' => 'vehicle-window-graphics',
                        'products' => [
                            $p('Vehicle Wrap Graphics', 'vehicle-wrap-graphics', 5999, 1, 50, 'Full or partial vehicle wrap graphics for mobile branding.'),
                            $p('Storefront Window Graphics', 'storefront-window-graphics', 1999, 1, 100, 'Printed vinyl graphics applied directly to storefront glass.'),
                            $p('One-Way Vision Window Film', 'one-way-vision-window-film', 1499, 1, 100, 'Perforated window film — visible outside, see-through from inside.'),
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Stickers & Labels',
                'slug' => 'stickers-labels',
                'blurb' => 'Die-cut stickers, sheet and roll labels, and product labelling.',
                'subcategories' => [
                    [
                        'name' => 'Die-Cut Stickers', 'slug' => 'die-cut-stickers',
                        'products' => [
                            $p('Custom Die-Cut Stickers', 'custom-die-cut-stickers', 5, 50, 20000, 'Stickers cut precisely to your custom shape and design.'),
                            $p('Vinyl Die-Cut Stickers', 'vinyl-die-cut-stickers', 7, 50, 20000, 'Durable, weatherproof vinyl stickers cut to shape.'),
                            $p('Holographic Die-Cut Stickers', 'holographic-die-cut-stickers', 9, 50, 20000, 'Eye-catching holographic-finish stickers cut to shape.'),
                        ],
                    ],
                    [
                        'name' => 'Sheet Labels', 'slug' => 'sheet-labels',
                        'products' => [
                            $p('A4 Sticker Sheets', 'a4-sticker-sheets', 49, 10, 5000, 'Multiple stickers laid out on a single A4 sheet for easy peeling.'),
                            $p('Product Barcode Label Sheets', 'product-barcode-label-sheets', 39, 10, 5000, 'Pre-sized barcode label sheets for retail and inventory.'),
                            $p('Kraft Sheet Labels', 'kraft-sheet-labels', 59, 10, 5000, 'Natural kraft-finish label sheets for an artisanal look.'),
                        ],
                    ],
                    [
                        'name' => 'Roll Labels', 'slug' => 'roll-labels',
                        'products' => [
                            $p('Custom Roll Labels', 'custom-roll-labels', 499, 1, 500, 'Continuous roll labels for dispenser-fed applying.'),
                            $p('Waterproof Roll Labels', 'waterproof-roll-labels', 699, 1, 500, 'Water- and smudge-resistant roll labels for bottles and outdoor use.'),
                            $p('Transparent Roll Labels', 'transparent-roll-labels', 799, 1, 500, 'Clear roll labels for a seamless, no-label look on packaging.'),
                        ],
                    ],
                    [
                        'name' => 'Product Labels', 'slug' => 'product-labels',
                        'products' => [
                            $p('Cosmetic Product Labels', 'cosmetic-product-labels', 6, 100, 50000, 'Labels sized and finished for cosmetic and skincare packaging.'),
                            $p('Food Jar Labels', 'food-jar-labels', 5, 100, 50000, 'Food-safe adhesive labels for jars and containers.'),
                            $p('Bottle Wrap Labels', 'bottle-wrap-labels', 8, 100, 50000, 'Full-wrap labels sized to fit around bottles.'),
                        ],
                    ],
                    [
                        'name' => 'Bumper & Wall Stickers', 'slug' => 'bumper-wall-stickers',
                        'products' => [
                            $p('Car Bumper Stickers', 'car-bumper-stickers', 99, 10, 5000, 'Durable outdoor-rated bumper stickers for vehicles.'),
                            $p('Wall Decal Stickers', 'wall-decal-stickers', 349, 1, 500, 'Removable wall decals for homes, offices and storefronts.'),
                            $p('Laptop Skin Stickers', 'laptop-skin-stickers', 249, 1, 500, 'Custom-fit vinyl skins to personalise laptops.'),
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Apparel',
                'slug' => 'apparel',
                'blurb' => 'Custom-printed and embroidered t-shirts, polos, hoodies, caps and workwear.',
                'subcategories' => [
                    [
                        'name' => 'T-Shirts', 'slug' => 't-shirts',
                        'products' => [
                            $p('Custom Printed Round-Neck T-Shirt', 'round-neck-t-shirt', 399, 1, 1000, 'Soft cotton round-neck t-shirt, printed with your design.'),
                            $p('Custom Printed V-Neck T-Shirt', 'v-neck-t-shirt', 429, 1, 1000, 'Cotton v-neck t-shirt, printed with your design.'),
                            $p('Oversized Graphic T-Shirt', 'oversized-graphic-t-shirt', 549, 1, 1000, 'Relaxed-fit oversized t-shirt for streetwear-style prints.'),
                        ],
                    ],
                    [
                        'name' => 'Polo Shirts', 'slug' => 'polo-shirts',
                        'products' => [
                            $p('Corporate Branded Polo Shirt', 'corporate-branded-polo-shirt', 599, 1, 1000, 'Smart cotton polo shirt printed or embroidered with your logo.'),
                            $p('Embroidered Polo Shirt', 'embroidered-polo-shirt', 699, 1, 1000, 'Polo shirt finished with durable, premium logo embroidery.'),
                            $p('Pique Cotton Polo Shirt', 'pique-cotton-polo-shirt', 649, 1, 1000, 'Breathable pique-knit cotton polo shirt for everyday wear.'),
                        ],
                    ],
                    [
                        'name' => 'Hoodies & Sweatshirts', 'slug' => 'hoodies-sweatshirts',
                        'products' => [
                            $p('Custom Printed Hoodie', 'custom-printed-hoodie', 999, 1, 500, 'Warm fleece-lined hoodie, printed with your design.'),
                            $p('Zip-Up Sweatshirt', 'zip-up-sweatshirt', 1099, 1, 500, 'Full-zip sweatshirt, custom printed or embroidered.'),
                            $p('Fleece Crew Sweatshirt', 'fleece-crew-sweatshirt', 899, 1, 500, 'Classic crew-neck fleece sweatshirt for custom branding.'),
                        ],
                    ],
                    [
                        'name' => 'Caps & Headwear', 'slug' => 'caps-headwear',
                        'products' => [
                            $p('Embroidered Baseball Cap', 'embroidered-baseball-cap', 299, 1, 1000, 'Adjustable baseball cap with embroidered logo.'),
                            $p('Custom Printed Snapback', 'custom-printed-snapback', 349, 1, 1000, 'Flat-brim snapback cap, printed or embroidered.'),
                            $p('Bucket Hat', 'bucket-hat', 399, 1, 1000, 'Custom-printed bucket hat for casual and event branding.'),
                        ],
                    ],
                    [
                        'name' => 'Aprons & Workwear', 'slug' => 'aprons-workwear',
                        'products' => [
                            $p('Branded Kitchen Apron', 'branded-kitchen-apron', 449, 1, 500, 'Durable kitchen apron printed or embroidered with your brand.'),
                            $p('Denim Work Apron', 'denim-work-apron', 599, 1, 500, 'Heavy-duty denim apron with pockets for workshop and retail use.'),
                            $p('Reflective Safety Vest', 'reflective-safety-vest', 399, 1, 1000, 'High-visibility safety vest with reflective strips and custom print.'),
                        ],
                    ],
                ],
            ],
        ];
    }
}
