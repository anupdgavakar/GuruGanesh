<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Brand;
use App\Models\ProductCategory;
use App\Models\ProductDesignMode;
use App\Models\Slider;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Spot-checks a lookup-table resource (design modes) and a content resource
 * (testimonials) — representative of the twelve resources added in Phase 2,
 * all wired through the same public-read / admin-write route pattern.
 */
class CatalogResourceSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_read_design_modes_but_not_write_them(): void
    {
        ProductDesignMode::factory()->count(2)->create();

        $this->getJson('/api/design-modes')->assertOk()->assertJsonCount(2, 'data');

        $this->postJson('/api/design-modes', [
            'name' => 'Hacked Mode',
            'slug' => 'hacked-mode',
        ])->assertUnauthorized();
    }

    public function test_admin_can_manage_testimonials_but_customer_cannot(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $customer = User::factory()->create(['role' => UserRole::Customer]);

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/testimonials', [
                'customer_name' => 'Fake Reviewer',
                'rating' => 5,
                'message' => 'Great!',
            ])->assertForbidden();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/testimonials', [
                'customer_name' => 'Real Customer',
                'rating' => 5,
                'message' => 'Great service!',
            ])->assertCreated();

        $this->assertDatabaseHas('testimonials', ['customer_name' => 'Real Customer']);
        $this->assertDatabaseMissing('testimonials', ['customer_name' => 'Fake Reviewer']);
    }

    public function test_staff_can_manage_the_catalog_but_customers_cannot(): void
    {
        // Phase 5: the admin panel is used by both admin and staff accounts
        // — 'role:admin,staff' lets both write, but a customer still can't.
        $staff = User::factory()->create(['role' => UserRole::Staff]);
        $customer = User::factory()->create(['role' => UserRole::Customer]);

        $this->actingAs($staff, 'sanctum')
            ->postJson('/api/brands', ['name' => 'Staff Brand', 'slug' => 'staff-brand'])
            ->assertCreated();

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/brands', ['name' => 'Nope', 'slug' => 'nope'])
            ->assertForbidden();

        $this->assertDatabaseHas('brands', ['slug' => 'staff-brand']);
        $this->assertDatabaseMissing('brands', ['slug' => 'nope']);
    }

    public function test_disabled_brands_are_hidden_from_the_public_but_visible_to_staff(): void
    {
        // Regression: BrandController::index ignored the status column
        // entirely, so a disabled brand was shown to every site visitor and
        // there was no way for the admin panel to opt into seeing it either.
        // Same ?include_inactive=1 pattern as products/blogs/sliders/services.
        Brand::factory()->create(['status' => true, 'slug' => 'active-brand']);
        Brand::factory()->create(['status' => false, 'slug' => 'disabled-brand']);

        $guestSlugs = $this->getJson('/api/brands')->json('data.*.slug');
        $this->assertContains('active-brand', $guestSlugs);
        $this->assertNotContains('disabled-brand', $guestSlugs);

        $staff = User::factory()->create(['role' => UserRole::Staff]);
        $staffSlugs = $this->actingAs($staff, 'sanctum')
            ->getJson('/api/brands?include_inactive=1')
            ->json('data.*.slug');
        $this->assertContains('disabled-brand', $staffSlugs);
    }

    public function test_guests_can_read_categories_but_not_write_them(): void
    {
        ProductCategory::factory()->count(3)->create();

        $this->getJson('/api/categories')->assertOk()->assertJsonCount(3, 'data');

        $this->postJson('/api/categories', [
            'name' => 'Hacked Category',
            'slug' => 'hacked-category',
        ])->assertUnauthorized();
    }

    public function test_slider_image_upload_persists_and_serves_a_url(): void
    {
        // Same regression as Product's thumbnail: image_path must be
        // fillable or Slider::create() silently drops the uploaded file's
        // path and image_url appends it for the frontend.
        Storage::fake('public');

        $admin = User::factory()->create(['role' => UserRole::Admin]);

        $response = $this->actingAs($admin, 'sanctum')
            ->post('/api/sliders', [
                'title' => 'Summer sale',
                'image' => UploadedFile::fake()->image('slide.jpg'),
            ])
            ->assertCreated();

        $slider = Slider::where('title', 'Summer sale')->firstOrFail();

        $this->assertNotNull($slider->image_path);
        $this->assertNotNull($response->json('data.image_url'));
        Storage::disk('public')->assertExists($slider->image_path);
    }
}
