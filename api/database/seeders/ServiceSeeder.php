<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

/**
 * The services shown on the storefront's Services page.
 *
 *   php artisan db:seed --class=ServiceSeeder
 *
 * Safe to run again: each service is matched by its slug and updated, never
 * duplicated. Pictures are not set here — add them per service in the admin
 * panel (Services > edit > Image); until then the page shows the matching
 * category's picture, or a coloured icon.
 */
class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'slug' => 'design-assistance',
                'name' => 'Design assistance',
                'short_description' => 'Our designers get your artwork print-ready, or create a new look from your idea.',
                'content' => 'Send us your artwork and we will check it and get it ready for print, or share an idea or a reference and our designers will create a new look for you.',
            ],
            [
                'slug' => 'logo-and-brand-identity-design',
                'name' => 'Logo and brand identity design',
                'short_description' => 'Logo, colours and a basic brand kit that carries across your cards, stationery and signage.',
                'content' => 'Starting a business or refreshing an old look? We design your logo and pick colours and styles that stay consistent across everything you print with us.',
            ],
            [
                'slug' => 'bulk-and-corporate-orders',
                'name' => 'Bulk and corporate orders',
                'short_description' => 'Volume printing and one point of contact for offices and businesses placing larger or repeat orders.',
                'content' => 'For offices, institutions and businesses that order in quantity or on a regular basis. Talk to us about your requirement and we will work out the best way to handle it.',
            ],
            [
                'slug' => 'rush-urgent-printing',
                'name' => 'Rush / urgent printing',
                'short_description' => 'Priority production for time-sensitive jobs.',
                'content' => 'Need something printed against a deadline? Tell us what you need and by when, and we will let you know what is possible.',
            ],
            [
                'slug' => 'custom-and-personalised-printing',
                'name' => 'Custom and personalised printing',
                'short_description' => 'One-off and small-run jobs: gifts, photo items, caps and promotional wear.',
                'content' => 'Single pieces and small quantities, personalised with your name, photo or message. Ideal for gifts, events, teams and promotions.',
            ],
            [
                'slug' => 'wedding-and-event-printing',
                'name' => 'Wedding and event printing',
                'short_description' => 'Invitations, cards, backdrops, banners and welcome boards for weddings and functions.',
                'content' => 'Everything printed for your big day or function, from invitation cards to stage backdrops, banners and welcome boards.',
            ],
            [
                'slug' => 'election-and-political-campaign-printing',
                'name' => 'Election and political campaign printing',
                'short_description' => 'Banners, flags, stickers, stage backdrops, direction boards and handouts for campaigns.',
                'content' => 'Campaign material in the quantities a campaign needs: banners, flags, vehicle and wall stickers, stage backdrops, direction boards and handouts.',
            ],
            [
                'slug' => 'signage-banners-and-display-printing',
                'name' => 'Signage, banners and display printing',
                'short_description' => 'Shop boards, flex banners, standees, posters and vehicle branding.',
                'content' => 'Make your shop or event hard to miss with boards, flex banners, standees, posters and vehicle branding.',
            ],
            [
                'slug' => 'packaging-and-labels',
                'name' => 'Packaging and labels',
                'short_description' => 'Boxes, bags, tags and product labels for retail and food businesses.',
                'content' => 'Packaging that carries your brand: boxes, bags, hang tags and product labels for shops, sweet marts, food businesses and more.',
            ],
            [
                'slug' => 'rubber-stamps-and-seals',
                'name' => 'Rubber stamps and seals',
                'short_description' => 'Custom stamps, seals and signature stamps.',
                'content' => 'Company stamps, round seals, signature stamps and more, made to your text and size.',
            ],
            [
                'slug' => 'delivery-and-shipping',
                'name' => 'Delivery and shipping',
                'short_description' => 'Delivery of finished orders to your door.',
                'content' => 'Once your order is ready we arrange delivery to your door. Ask us about delivery to your location when you place your order.',
            ],
            [
                'slug' => 'free-templates-and-proofing',
                'name' => 'Free templates and proofing',
                'short_description' => 'Ready-made templates and a design proof for your approval before printing.',
                'content' => 'Pick from ready-made templates and see a design proof for your approval before your job goes to print.',
            ],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(
                ['slug' => $service['slug']],
                $service + ['status' => true, 'meta_title' => $service['name'].' | GuruGanesh Graphics'],
            );
        }
    }
}
