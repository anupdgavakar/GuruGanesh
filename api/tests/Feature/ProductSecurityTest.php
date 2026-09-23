<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * These tests exist specifically to prove the old API's biggest problem is
 * fixed: every write route was reachable with no authentication at all.
 */
class ProductSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_browse_products(): void
    {
        Product::factory()->count(3)->create();

        $this->getJson('/api/products')->assertOk();
    }

    public function test_disabled_products_are_hidden_from_the_public_but_visible_to_staff(): void
    {
        // Regression: index() used to hard-filter to status=true with no way
        // for the admin panel to ever see (and re-enable) a disabled product.
        Product::factory()->create(['status' => true, 'slug' => 'visible-product']);
        Product::factory()->create(['status' => false, 'slug' => 'disabled-product']);

        $guestSlugs = $this->getJson('/api/products')->json('data.data.*.slug');
        $this->assertContains('visible-product', $guestSlugs);
        $this->assertNotContains('disabled-product', $guestSlugs);

        // A logged-in customer asking for include_inactive=1 still doesn't get it.
        $customer = User::factory()->create(['role' => UserRole::Customer]);
        $customerSlugs = $this->actingAs($customer, 'sanctum')
            ->getJson('/api/products?include_inactive=1')
            ->json('data.data.*.slug');
        $this->assertNotContains('disabled-product', $customerSlugs);

        // Staff opting in with include_inactive=1 sees everything.
        $staff = User::factory()->create(['role' => UserRole::Staff]);
        $staffSlugs = $this->actingAs($staff, 'sanctum')
            ->getJson('/api/products?include_inactive=1')
            ->json('data.data.*.slug');
        $this->assertContains('visible-product', $staffSlugs);
        $this->assertContains('disabled-product', $staffSlugs);

        // Staff who forgets the flag still only sees active ones by default.
        $defaultSlugs = $this->actingAs($staff, 'sanctum')
            ->getJson('/api/products')
            ->json('data.data.*.slug');
        $this->assertNotContains('disabled-product', $defaultSlugs);
    }

    public function test_guests_cannot_create_products(): void
    {
        $category = ProductCategory::factory()->create();

        $this->postJson('/api/products', [
            'category_id' => $category->id,
            'name' => 'Hacked Product',
            'slug' => 'hacked-product',
            'base_price' => 1,
            'min_quantity' => 1,
        ])->assertUnauthorized();

        $this->assertDatabaseMissing('products', ['slug' => 'hacked-product']);
    }

    public function test_logged_in_customers_cannot_create_products(): void
    {
        $customer = User::factory()->create(['role' => UserRole::Customer]);
        $category = ProductCategory::factory()->create();

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/products', [
                'category_id' => $category->id,
                'name' => 'Customer Product',
                'slug' => 'customer-product',
                'base_price' => 1,
                'min_quantity' => 1,
            ])->assertForbidden();
    }

    public function test_admins_can_create_products(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $category = ProductCategory::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/products', [
                'category_id' => $category->id,
                'name' => 'Admin Product',
                'slug' => 'admin-product',
                'base_price' => 499.99,
                'min_quantity' => 10,
            ])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'admin-product');

        $this->assertDatabaseHas('products', ['slug' => 'admin-product']);
    }

    public function test_staff_can_create_products_too(): void
    {
        // Phase 5: the admin panel is for admin AND staff accounts —
        // ProductPolicy uses canManageCatalog(), not isAdmin() alone.
        $staff = User::factory()->create(['role' => UserRole::Staff]);
        $category = ProductCategory::factory()->create();

        $this->actingAs($staff, 'sanctum')
            ->postJson('/api/products', [
                'category_id' => $category->id,
                'name' => 'Staff Product',
                'slug' => 'staff-product',
                'base_price' => 99,
                'min_quantity' => 1,
            ])
            ->assertCreated();

        $this->assertDatabaseHas('products', ['slug' => 'staff-product']);
    }

    public function test_guests_cannot_delete_products(): void
    {
        // Product::getRouteKeyName() is 'slug' (SEO-friendly public URLs),
        // so the route binding itself is keyed on slug, not id.
        $product = Product::factory()->create();

        $this->deleteJson("/api/products/{$product->slug}")->assertUnauthorized();

        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_role_is_not_mass_assignable(): void
    {
        // The old app's User model had no guard on `role` at all — nothing
        // stopped a request payload from setting it directly. Here it's
        // simply absent from $fillable, so mass assignment can't touch it.
        $this->assertNotContains('role', (new User())->getFillable());
    }

    public function test_thumbnail_upload_persists_and_serves_a_url(): void
    {
        // Regression test: thumbnail_path/header_image_path were originally
        // left out of Product::$fillable "for safety", which actually meant
        // Product::create() silently dropped them — the file got uploaded
        // to storage but the column stayed null forever. They're fillable
        // now (safe: no request rule accepts a raw *_path string), and
        // thumbnail_url/header_image_url are appended so the frontend never
        // has to know the storage path scheme.
        Storage::fake('public');

        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $category = ProductCategory::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->post('/api/products', [
                'category_id' => $category->id,
                'name' => 'Photo Product',
                'slug' => 'photo-product',
                'base_price' => 199,
                'min_quantity' => 1,
                'thumbnail' => UploadedFile::fake()->image('thumb.jpg'),
            ])
            ->assertCreated();

        $product = Product::where('slug', 'photo-product')->firstOrFail();

        $this->assertNotNull($product->thumbnail_path);
        $this->assertNotNull($response->json('data.thumbnail_url'));
        Storage::disk('public')->assertExists($product->thumbnail_path);
    }
}
