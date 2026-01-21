<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_amount',
        'max_discount_amount',
        'is_active',
        'single_use',
        'usage_limit',
        'usage_count',
        'starts_at',
        'expires_at',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'single_use' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->starts_at && now() < $this->starts_at) {
            return false;
        }

        if ($this->expires_at && now() > $this->expires_at) {
            return false;
        }

        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }
}
