<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Roles become data: an admin can edit what a role may do and create new
 * ones. users.role already holds a short text key, so it simply points at
 * roles.key — no change to the users table. The five built-in roles are
 * created here with the access they have always had.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('key', 60)->unique();
            $table->string('name', 80);
            $table->text('description')->nullable();
            $table->json('permissions');
            $table->boolean('is_system')->default(false);
            $table->timestamps();
        });

        $everyone = ['catalog', 'content', 'orders', 'inquiries', 'design_files', 'settings', 'assign', 'delete_records'];

        $roles = [
            ['admin', 'Admin', 'Everything, including the Team page, settings and deleting records.', [...$everyone, 'users']],
            ['manager', 'Manager', 'Catalog, website content, orders, inquiries, settings and assigning work. Cannot manage team accounts.', $everyone],
            ['staff', 'Staff (older role)', 'The original shared role. Same access as a Manager.', $everyone],
            ['sales', 'Sales', 'Inquiries, price requests and orders only — sees the real prices. Cannot change the catalog or delete anything.', ['orders', 'inquiries']],
            ['designer', 'Designer', "Orders and customers' design files only.", ['orders', 'design_files']],
        ];

        foreach ($roles as [$key, $name, $description, $permissions]) {
            DB::table('roles')->insert([
                'key' => $key,
                'name' => $name,
                'description' => $description,
                'permissions' => json_encode($permissions),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
