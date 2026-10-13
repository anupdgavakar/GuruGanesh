<?php

namespace App\Models;

use App\Models\Concerns\HasHandler;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactInquiry extends Model
{
    use HasFactory, HasHandler;

    /** The product a price request is about (null for ordinary contact messages). */
    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // 'status' is fillable — safe, because the public submission endpoint
    // (ContactInquiryRequest) never validates a 'status' field, only the
    // separate admin-only UpdateInquiryStatusRequest does.
    protected $fillable = [
        'name', 'email', 'phone', 'subject', 'message', 'status',
        // Set only by PriceRequestController (server-side), never from the
        // public contact form, which validates just the fields above.
        'type', 'user_id', 'product_id', 'quantity',
    ];
}
