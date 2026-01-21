<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_sku',
        'quantity',
        'price',
        'total',
        'is_picked',
        'is_packed',
        'picked_at',
        'packed_at',
        'picked_quantity',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'total' => 'decimal:2',
        'is_picked' => 'boolean',
        'is_packed' => 'boolean',
        'picked_at' => 'datetime',
        'packed_at' => 'datetime',
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
