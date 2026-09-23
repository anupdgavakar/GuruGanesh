<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\ContactInquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactInquiryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_submit_the_contact_form(): void
    {
        $this->postJson('/api/inquiries', [
            'name' => 'Priya Sharma',
            'email' => 'priya@example.com',
            'phone' => '9876543210',
            'subject' => 'Bulk order',
            'message' => 'Do you offer bulk pricing on business cards?',
        ])->assertCreated();

        $this->assertDatabaseHas('contact_inquiries', ['email' => 'priya@example.com', 'status' => 'new']);
    }

    public function test_honeypot_field_silently_rejects_bots(): void
    {
        $this->postJson('/api/inquiries', [
            'name' => 'Bot',
            'email' => 'bot@example.com',
            'message' => 'Buy cheap watches',
            'website' => 'https://spam.example.com', // real users never fill this in
        ])->assertUnprocessable();

        $this->assertDatabaseMissing('contact_inquiries', ['email' => 'bot@example.com']);
    }

    public function test_inquiries_are_not_publicly_readable(): void
    {
        ContactInquiry::factory()->create();

        // No public index/show — unlike the catalog resources, this is PII.
        $this->getJson('/api/inquiries')->assertUnauthorized();
    }

    public function test_only_admins_can_read_and_manage_inquiries(): void
    {
        $inquiry = ContactInquiry::factory()->create();
        $customer = User::factory()->create(['role' => UserRole::Customer]);
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($customer, 'sanctum')->getJson('/api/inquiries')->assertForbidden();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/inquiries')
            ->assertOk()
            ->assertJsonCount(1, 'data.data');

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/inquiries/{$inquiry->id}", ['status' => 'read'])
            ->assertOk()
            ->assertJsonPath('data.status', 'read');
    }
}
