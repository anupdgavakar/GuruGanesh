<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactInquiry extends Model
{
    use HasFactory;

    // 'status' is fillable — safe, because the public submission endpoint
    // (ContactInquiryRequest) never validates a 'status' field, only the
    // separate admin-only UpdateInquiryStatusRequest does.
    protected $fillable = ['name', 'email', 'phone', 'subject', 'message', 'status'];
}
