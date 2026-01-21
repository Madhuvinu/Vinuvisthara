<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'session_id',
        'subtotal',
        'tax',
        'shipping',
        'discount',
        'total',
        'coupon_code',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function recalculateTotal(): void
    {
        $this->subtotal = $this->items->sum('total');
        
        // Calculate tax based on each product's tax rate
        $tax = 0;
        foreach ($this->items as $item) {
            if ($item->product) {
                $productTaxRate = $item->product->tax_rate ?? 18.00; // Default to 18% if not set
                $itemTax = ($item->total * $productTaxRate) / 100;
                $tax += $itemTax;
            }
        }
        
        // If no items or no products, use default 18% on subtotal
        if ($tax == 0 && $this->subtotal > 0) {
            $tax = $this->subtotal * 0.18;
        }
        
        $this->tax = round($tax, 2);
        
        // Calculate shipping using ShippingSettings
        $this->shipping = \App\Models\ShippingSettings::calculateShipping($this->subtotal);
        
        $this->total = $this->subtotal + $this->tax + $this->shipping - ($this->discount ?? 0);
        $this->save();
    }
}
