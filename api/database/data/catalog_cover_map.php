<?php

/**
 * Which picture goes to which category / subcategory.

 * Used by `php artisan catalog:import-cover-images`. Each entry names the
 * category (and subcategory) exactly as it appears in the admin panel, and
 * the picture's file name from the "category images" / "subcategory images"
 * folders. The file is found by letters and digits only (the number stamp in
 * the name and the "…" cut-off are ignored), so it doesn't matter if Windows
 * shows the name slightly differently.
 *
 * To change a picture, edit the file name on its line and run the command again
 * with --overwrite.
 */

return [
    'categories' => [
        ['Visiting Cards', 'visitingcardsarrangement'], // Visiting_cards_arrangement_20261009135436.jpg
        ['Notebooks, Diaries & Office Writing', 'notebooksandpensarranged'], // Notebooks_and_pens_arranged_20261009135436.jpg
        ['Rubber Stamps & Seals', 'rubberstampsandsealsarrangement'], // Rubber_stamps_and_seals_arrangement_20261009135436.jpg
        ['Flyers, Brochures & Marketing Materials', 'marketingmaterialsarrangedfor'], // Marketing_materials_arranged_for…_20261009135436.jpg
        ['Posters, Banners & Display Materials', 'displayitemsproductphotography'], // Display_items_product_photography_20261009135436.jpg
        ['Corporate Branding Materials', 'corporatebrandingitemsarrange'], // Corporate_branding_items_arrange…_20261009135436.jpg
        ['Stickers & Labels', 'stickersheetandglassbottle'], // Sticker_sheet_and_glass_bottle_20261009135436.jpg
        ['Packaging & Bags', 'productpackagingdisplayinstudio'], // Product_packaging_display_in_studio_20261009135436.jpg
        ['Tags & Cards', 'productphotographyoftagsand'], // Product_photography_of_tags_and_20261009135436.jpg
        ['Design & Creative Services', 'designdeliverablesarrangement'], // Design_deliverables_arrangement_…_20261009135436.jpg
        ['Election & Political Campaign Materials', 'campaignmaterialsarrangedneatly'], // Campaign_materials_arranged_neatly_20261009135436.jpg
        ['Photo Gifts & Personalised Gifts', 'photogiftsandalbumdisplay'], // Photo_gifts_and_album_display_20261009135436.jpg
        ['Restaurant, Cafe & Hotel Printing', 'restaurantmenuandpackagingpr'], // Restaurant_menu_and_packaging_pr…_20261009135436.jpg
        ['Caps & Promotional Wear', 'apparelitemsarrangedinstudio'], // Apparel_items_arranged_in_studio_20261009135436.jpg
    ],

    'subcategories' => [
        ['Visiting Cards', 'Standard Visiting Cards', 'visitingcardsproductphotography'], // Visiting_cards_product_photography_20261009124330.jpg
        ['Visiting Cards', 'Premium Visiting Cards', 'businesscardsondisplay'], // Business_cards_on_display_20261009124330.jpg
        ['Visiting Cards', 'Special Shape Visiting Cards', 'visitingcardsarrangementprodu'], // Visiting_cards_arrangement_produ…_20261009124330.jpg
        ['Visiting Cards', 'Digital Visiting Cards', 'smartphonescanningqrcode'], // Smartphone_scanning_QR_code_20261009124330.jpg
        ['Visiting Cards', 'Visiting Card Accessories', 'cardholdersarrangementproduct'], // Card_holders_arrangement_product…_20261009124330.jpg
        ['Business Stationery', 'Letterheads', 'letterheadsandpenarranged'], // Letterheads_and_pen_arranged_20261009124330.jpg
        ['Business Stationery', 'Envelopes', 'printedcompanyenvelopesproduc'], // Printed_company_envelopes_produc…_20261009124330.jpg
        ['Business Stationery', 'Office Books', 'stackofofficebooks'], // Stack_of_office_books_20261009124330.jpg
        ['Business Stationery', 'Office Identity', 'officeidentityitemsarrangement'], // Office_identity_items_arrangement_20261009124330.jpg
        ['Business Stationery', 'Certificates & Recognition', 'displayingawardsandcertificates'], // Displaying_awards_and_certificates_20261009124330.jpg
        ['Notebooks, Diaries & Office Writing', 'Notebooks', 'customnotebooksproductphotogr'], // Custom_notebooks_product_photogr…_20261009124330.jpg
        ['Notebooks, Diaries & Office Writing', 'Diaries', 'promotionalproductsdisplayedf'], // Promotional_products_displayed_f…_20261009124330.jpg
        ['Notebooks, Diaries & Office Writing', 'Writing Accessories', 'brandedpensproductarrangement'], // Branded_pens_product_arrangement_20261009124330.jpg
        ['Rubber Stamps & Seals', 'Rubber Stamps', 'rubberstampsproductphotography'], // Rubber_stamps_product_photography_20261009124330.jpg
        ['Rubber Stamps & Seals', 'Embossing', 'metalembossertoolandpaper'], // Metal_embosser_tool_and_paper_20261009124330.jpg
        ['Flyers, Brochures & Marketing Materials', 'Flyers', 'marketingflyersforfitnesscenter'], // Marketing_flyers_for_fitness_center_20261009124330.jpg
        ['Flyers, Brochures & Marketing Materials', 'Brochures', 'brochuresforresortarrangement'], // Brochures_for_resort_arrangement_20261009124330.jpg
        ['Flyers, Brochures & Marketing Materials', 'Booklets', 'bookletsandcataloguescommerci'], // Booklets_and_catalogues_commerci…_20261009124330.jpg
        ['Flyers, Brochures & Marketing Materials', 'Promotional Prints', 'commercialpromotionalprintsar'], // Commercial_promotional_prints_ar…_20261009124330.jpg
        ['Posters, Banners & Display Materials', 'Posters', 'postersdisplayedforartgallery'], // Posters_displayed_for_art_gallery_20261009124330.jpg
        ['Posters, Banners & Display Materials', 'Banners', 'storebannersproductphotography'], // Store_banners_product_photography_20261009124330.jpg
        ['Posters, Banners & Display Materials', 'Boards & Signs', 'signsandboardsproductarrange'], // Signs_and_boards_product_arrange…_20261009124330.jpg
        ['Corporate Branding Materials', 'Office Branding', 'officebrandingmockupsforlaw'], // Office_branding_mockups_for_law_20261009124330.jpg
        ['Corporate Branding Materials', 'Promotional Branding', 'promotionalproductsarrangement'], // Promotional_products_arrangement…_20261009124330.jpg
        ['Corporate Branding Materials', 'Vehicle Branding', 'vehiclebrandingmockupwithvans'], // Vehicle_branding_mockup_with_vans_20261009124330.jpg
        ['Stickers & Labels', 'Custom Stickers', 'customstickersheetsarrangement'], // Custom_sticker_sheets_arrangement_20261009124330.jpg
        ['Stickers & Labels', 'Product Labels', 'productlabelsonthreecontainers'], // Product_labels_on_three_containers_20261009124330.jpg
        ['Packaging & Bags', 'Paper Bags', 'shoppingpaperbagsarrangement'], // Shopping_paper_bags_arrangement_20261009124330.jpg
        ['Packaging & Bags', 'Carry Bags', 'fourcarrybagsarranged'], // Four_carry_bags_arranged_20261009124330.jpg
        ['Packaging & Bags', 'Courier & Shipping', 'courierandshippingbagsdisplay'], // Courier_and_shipping_bags_display_20261009124330.jpg
        ['Packaging & Bags', 'Packaging Boxes', 'packagingboxesarrangedforbrand'], // Packaging_boxes_arranged_for_brand_20261009124330.jpg
        ['Packaging & Bags', 'Packaging Accessories', 'packagingaccessoriesarrangemen'], // Packaging_accessories_arrangemen…_20261009124330.jpg
        ['Calendars', 'Calendars', 'calendarsarrangedforlawfirm'], // Calendars_arranged_for_law_firm_20261009124330.jpg
        ['Caps & Promotional Wear', 'Promotional Accessories', 'promotionalproductsarrangement2'], // Promotional_products_arrangement…_20261009124330_2.jpg
        ['Election & Political Campaign Materials', 'Election Banners', 'electionbannersproductphotogr'], // Election_banners_product_photogr…_20261009124330.jpg
        ['Election & Political Campaign Materials', 'Election Flags & Displays', 'electionflagsanddisplaysprod'], // Election_flags_and_displays_prod…_20261009124330.jpg
        ['Election & Political Campaign Materials', 'Election Stickers', 'electionstickersproductphotog'], // Election_stickers_product_photog…_20261009124330.jpg
        ['Election & Political Campaign Materials', 'Election Posters', 'politicalcampaignpostersarran'], // Political_campaign_posters_arran…_20261009124330.jpg
        ['Election & Political Campaign Materials', 'Campaign Clothing', 'clothingitemsandcapsdisplayed'], // Clothing_items_and_caps_displayed_20261009124330.jpg
        ['Election & Political Campaign Materials', 'Candidate Branding', 'stationerysetforpoliticalparty'], // Stationery_set_for_political_party_20261009124330.jpg
        ['Photo Gifts & Personalised Gifts', 'Personalised Gifts', 'personalizedgiftsproductphoto'], // Personalized_gifts_product_photo…_20261009124330.jpg
        ['Photo Gifts & Personalised Gifts', 'Photo Products', 'commercialphotographyofphoto'], // Commercial_photography_of_photo_…_20261009124330.jpg
        ['Real Estate Printing', 'Property Marketing', 'propertymarketingproductphoto'], // Property_marketing_product_photo…_20261009124330.jpg
        ['Restaurant, Cafe & Hotel Printing', 'Food Packaging', 'foodpackagingproductsdisplayed'], // Food_packaging_products_displayed_20261009124330.jpg
        ['Wedding & Event Printing', 'Event Materials', 'eventstationeryproductsproduc'], // Event_stationery_products_produc…_20261009124330.jpg
        ['Wedding & Event Printing', 'Wedding Invitations', 'weddinginvitationsproductarra'], // Wedding_invitations_product_arra…_20261009124330.jpg
    ],
];
