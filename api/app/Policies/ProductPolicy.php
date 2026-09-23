<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Anyone can browse the catalog — index/show are public routes and
     * never reach this policy. Admin AND staff can manage products (the
     * admin panel is meant for both roles); only a customer is refused.
     */
    public function create(User $user): bool
    {
        return $user->canManageCatalog();
    }

    public function update(User $user, Product $product): bool
    {
        return $user->canManageCatalog();
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->canManageCatalog();
    }
}
