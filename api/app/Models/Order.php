<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    // 'status' is fillable — safe, because the public submission endpoint
    // (OrderRequest) never validates a 'status' field, only the separate
    // admin-only UpdateOrderStatusRequest does. Same pattern as ContactInquiry.
    protected $fillable = [
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'notes',
        'subtotal',
        'status',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
