<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductDeliveryOption extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'estimated_days'];
}
