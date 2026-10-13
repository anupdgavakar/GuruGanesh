<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\ContactInquiry;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TeamAccessTest extends TestCase
{
    use RefreshDatabase;

    private function as(UserRole $role): User
    {
        $user = User::factory()->create(['role' => $role]);
        Sanctum::actingAs($user);

        return $user;
    }

    private function makeRole(string $key, string $name, array $permissions): \App\Models\Role
    {
        $role = new \App\Models\Role(['name' => $name, 'permissions' => $permissions]);
        $role->forceFill(['key' => $key, 'is_system' => false])->save();

        return $role;
    }

    private function inquiry(): ContactInquiry
    {
        return ContactInquiry::create([
            'name' => 'Priya', 'email' => 'priya@example.com', 'message' => 'Hello there', 'subject' => 'Hi',
        ]);
    }

    private function order(): Order
    {
        return Order::create([
            'customer_name' => 'Priya', 'customer_email' => 'priya@example.com',
            'customer_phone' => '9876543210', 'subtotal' => '100.00',
        ]);
    }

    public function test_sales_can_work_inquiries_and_orders_but_not_the_catalog(): void
    {
        $this->as(UserRole::Sales);

        $this->getJson('/api/inquiries')->assertOk();
        $this->getJson('/api/orders')->assertOk();
        $this->postJson('/api/brands', ['name' => 'Nope'])->assertForbidden();
        $this->getJson('/api/users')->assertForbidden();
        $this->patchJson('/api/settings', ['hide_prices' => true])->assertForbidden();
    }

    public function test_designer_sees_orders_but_not_inquiries(): void
    {
        $this->as(UserRole::Designer);

        $this->getJson('/api/orders')->assertOk();
        $this->getJson('/api/inquiries')->assertForbidden();
    }

    public function test_only_admin_can_manage_team_accounts(): void
    {
        $this->as(UserRole::Manager);
        $this->getJson('/api/users')->assertForbidden();
        $this->postJson('/api/users', [])->assertForbidden();
    }

    public function test_sales_and_designers_cannot_delete_records(): void
    {
        $inquiry = $this->inquiry();
        $this->as(UserRole::Sales);

        $this->deleteJson("/api/inquiries/{$inquiry->id}")->assertForbidden();
        $this->assertDatabaseHas('contact_inquiries', ['id' => $inquiry->id]);
    }

    public function test_admin_creates_a_team_member_who_can_then_sign_in(): void
    {
        $this->as(UserRole::Admin);

        $this->postJson('/api/users', [
            'name' => 'Rahul Sales', 'email' => 'rahul@example.com', 'phone' => '9811122233',
            'role' => 'sales', 'password' => 'a-good-password',
        ])->assertCreated()->assertJsonPath('data.role', 'sales');

        $this->app['auth']->forgetGuards();

        $this->postJson('/api/auth/login', ['email' => 'rahul@example.com', 'password' => 'a-good-password'])
            ->assertOk()
            ->assertJsonPath('user.role', 'sales')
            ->assertJsonPath('user.permissions.0', 'orders');
    }

    public function test_a_customer_role_cannot_be_given_from_the_team_screen(): void
    {
        $this->as(UserRole::Admin);

        $this->postJson('/api/users', [
            'name' => 'X', 'email' => 'x@example.com', 'role' => 'customer', 'password' => 'a-good-password',
        ])->assertUnprocessable();
    }

    public function test_switched_off_accounts_cannot_sign_in(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Sales, 'is_active' => false, 'password' => 'a-good-password',
            'email' => 'off@example.com',
        ]);

        $this->postJson('/api/auth/login', ['email' => 'off@example.com', 'password' => 'a-good-password'])
            ->assertUnprocessable();

        Sanctum::actingAs($user);
        $this->getJson('/api/orders')->assertForbidden();
    }

    public function test_the_last_active_admin_cannot_be_removed_or_demoted(): void
    {
        $admin = $this->as(UserRole::Admin);
        $other = User::factory()->create(['role' => UserRole::Admin]);

        // Two admins: fine to switch the other one off...
        $this->patchJson("/api/users/{$other->id}", ['is_active' => false])->assertOk();

        // ...but now the signed-in admin is the last, and can't change themselves.
        $this->patchJson("/api/users/{$admin->id}", ['role' => 'manager'])->assertUnprocessable();
        $this->deleteJson("/api/users/{$admin->id}")->assertUnprocessable();
    }

    public function test_first_non_admin_to_open_a_request_becomes_its_handler(): void
    {
        $inquiry = $this->inquiry();
        $sales = $this->as(UserRole::Sales);

        $this->getJson("/api/inquiries/{$inquiry->id}")
            ->assertOk()
            ->assertJsonPath('data.assignee.id', $sales->id)
            ->assertJsonPath('data.activities.0.action', 'claimed');

        // A second person opening it does not take it over.
        $other = User::factory()->create(['role' => UserRole::Manager]);
        Sanctum::actingAs($other);
        $this->getJson("/api/inquiries/{$inquiry->id}")
            ->assertJsonPath('data.assignee.id', $sales->id);
    }

    public function test_an_admin_only_looking_does_not_take_the_request(): void
    {
        $order = $this->order();
        $this->as(UserRole::Admin);

        $this->getJson("/api/orders/{$order->id}")->assertOk()->assertJsonPath('data.assignee', null);
    }

    public function test_changing_status_is_recorded_and_claims_an_unassigned_request(): void
    {
        $order = $this->order();
        $admin = $this->as(UserRole::Admin);

        $this->patchJson("/api/orders/{$order->id}", ['status' => 'confirmed'])
            ->assertOk()
            ->assertJsonPath('data.assignee.id', $admin->id);

        $this->assertDatabaseHas('activity_logs', [
            'subject_id' => $order->id, 'action' => 'status_changed',
            'from_value' => 'pending_review', 'to_value' => 'confirmed', 'user_id' => $admin->id,
        ]);
    }

    public function test_assigning_checks_the_person_can_work_on_that_kind_of_request(): void
    {
        $inquiry = $this->inquiry();
        $this->as(UserRole::Manager);

        $designer = User::factory()->create(['role' => UserRole::Designer]);
        $sales = User::factory()->create(['role' => UserRole::Sales]);

        $this->patchJson("/api/inquiries/{$inquiry->id}/assign", ['user_id' => $designer->id])->assertUnprocessable();

        $this->patchJson("/api/inquiries/{$inquiry->id}/assign", ['user_id' => $sales->id])
            ->assertOk()
            ->assertJsonPath('data.assignee.id', $sales->id);
    }

    public function test_sales_cannot_reassign_requests(): void
    {
        $inquiry = $this->inquiry();
        $this->as(UserRole::Sales);

        $this->patchJson("/api/inquiries/{$inquiry->id}/assign", ['user_id' => null])->assertForbidden();
    }

    public function test_notes_appear_on_the_timeline_under_the_author(): void
    {
        $inquiry = $this->inquiry();
        $sales = $this->as(UserRole::Sales);

        $this->postJson("/api/inquiries/{$inquiry->id}/notes", ['note' => 'Called, will confirm tomorrow.'])
            ->assertCreated()
            ->assertJsonPath('data.activities.0.note', 'Called, will confirm tomorrow.')
            ->assertJsonPath('data.activities.0.user_name', $sales->name);
    }

    public function test_admin_can_create_a_custom_role_and_give_it_to_someone(): void
    {
        $this->as(UserRole::Admin);

        $this->postJson('/api/roles', [
            'name' => 'Front desk',
            'description' => 'Answers inquiries.',
            'permissions' => ['inquiries'],
        ])->assertCreated()->assertJsonPath('data.key', 'front_desk');

        $this->postJson('/api/users', [
            'name' => 'Asha', 'email' => 'asha@example.com', 'role' => 'front_desk', 'password' => 'a-good-password',
        ])->assertCreated()->assertJsonPath('data.role_name', 'Front desk');

        $asha = User::where('email', 'asha@example.com')->first();
        Sanctum::actingAs($asha);

        $this->getJson('/api/inquiries')->assertOk();
        $this->getJson('/api/orders')->assertForbidden();
        $this->getJson('/api/roles')->assertForbidden();
    }

    public function test_editing_a_role_changes_access_straight_away(): void
    {
        $admin = $this->as(UserRole::Admin);
        $role = $this->makeRole('helper', 'Helper', ['inquiries']);
        $helper = User::factory()->create(['role' => 'helper']);

        Sanctum::actingAs($helper);
        $this->getJson('/api/orders')->assertForbidden();

        Sanctum::actingAs($admin);
        $this->patchJson("/api/roles/{$role->id}", ['name' => 'Helper', 'permissions' => ['inquiries', 'orders']])->assertOk();

        Sanctum::actingAs($helper->fresh());
        $this->getJson('/api/orders')->assertOk();
    }

    public function test_the_users_permission_cannot_be_given_to_a_custom_role(): void
    {
        $this->as(UserRole::Admin);

        $this->postJson('/api/roles', ['name' => 'Sneaky', 'permissions' => ['users']])->assertUnprocessable();
    }

    public function test_admin_role_cannot_be_edited_and_built_in_roles_cannot_be_deleted(): void
    {
        $this->as(UserRole::Admin);

        $admin = \App\Models\Role::where('key', 'admin')->first();
        $sales = \App\Models\Role::where('key', 'sales')->first();

        $this->patchJson("/api/roles/{$admin->id}", ['name' => 'Admin', 'permissions' => []])->assertUnprocessable();
        $this->deleteJson("/api/roles/{$sales->id}")->assertUnprocessable();
    }

    public function test_a_role_that_people_still_have_cannot_be_deleted(): void
    {
        $this->as(UserRole::Admin);

        $role = $this->makeRole('temp', 'Temp', ['orders']);
        User::factory()->create(['role' => 'temp']);

        $this->deleteJson("/api/roles/{$role->id}")->assertUnprocessable();
    }

    public function test_only_roles_that_exist_can_be_given_to_a_team_member(): void
    {
        $this->as(UserRole::Admin);

        $this->postJson('/api/users', [
            'name' => 'X', 'email' => 'x@example.com', 'role' => 'made_up', 'password' => 'a-good-password',
        ])->assertUnprocessable();
    }
}
