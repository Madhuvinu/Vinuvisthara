<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_id',
        'status',
        'fulfillment_status',
        'payment_status',
        'subtotal',
        'tax',
        'shipping',
        'discount',
        'total',
        'coupon_code',
        'shipping_address',
        'billing_address',
        'notes',
        'tracking_number',
        'carrier',
        'shipped_at',
        'delivered_at',
        'processed_at',
        'picked_at',
        'packed_at',
        'fulfillment_notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'shipping_address' => 'array',
        'billing_address' => 'array',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'processed_at' => 'datetime',
        'picked_at' => 'datetime',
        'packed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function ($order) {
            if (!$order->order_number) {
                $order->order_number = 'ORD-' . time() . '-' . strtoupper(substr(md5(uniqid()), 0, 8));
            }
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
