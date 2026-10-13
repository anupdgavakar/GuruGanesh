<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    // Only ever written by OrderController::store, never from raw request
    // input — product_name/product_slug/unit_price are a snapshot taken at
    // order time (never re-read live off the product), so a later catalog
    // price change or product deletion never rewrites past order history.
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_slug',
        'unit_price',
        'quantity',
        'line_total',
        // How the customer is getting us their artwork — all optional, see
        // the add_design_fields_to_order_items_table migration.
        'design_delivery_method',
        'design_reference',
        'design_original_filename',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'line_total' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
