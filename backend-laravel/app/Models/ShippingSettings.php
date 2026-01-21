<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'flat_rate_amount',
        'free_shipping_threshold',
        'weight_rate_per_kg',
        'distance_rate_per_km',
        'min_shipping_charge',
        'max_shipping_charge',
        'is_active',
        'applicable_states',
        'applicable_cities',
    ];

    protected $casts = [
        'flat_rate_amount' => 'decimal:2',
        'free_shipping_threshold' => 'decimal:2',
        'weight_rate_per_kg' => 'decimal:2',
        'distance_rate_per_km' => 'decimal:2',
        'min_shipping_charge' => 'decimal:2',
        'max_shipping_charge' => 'decimal:2',
        'is_active' => 'boolean',
        'applicable_states' => 'array',
        'applicable_cities' => 'array',
    ];

    // Singleton pattern - always get the first active record
    public static function getActiveSettings()
    {
        return static::where('is_active', true)->first() ?? static::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Default Shipping',
                'type' => 'free_shipping_threshold',
                'flat_rate_amount' => 100,
                'free_shipping_threshold' => 999,
                'weight_rate_per_kg' => 50,
                'distance_rate_per_km' => 5,
                'min_shipping_charge' => 0,
                'max_shipping_charge' => null,
                'is_active' => true,
            ]
        );
    }

    /**
     * Calculate shipping cost based on settings
     */
    public static function calculateShipping($subtotal, $weight = 0, $distance = 0, $state = null, $city = null): float
    {
        $settings = static::getActiveSettings();
        
        if (!$settings || !$settings->is_active) {
            return 0;
        }

        // Check if shipping applies to this location
        if ($settings->applicable_states && $state && !in_array($state, $settings->applicable_states)) {
            return 0; // Shipping not available for this state
        }
        
        if ($settings->applicable_cities && $city && !in_array($city, $settings->applicable_cities)) {
            return 0; // Shipping not available for this city
        }

        $shipping = 0;

        switch ($settings->type) {
            case 'flat_rate':
                $shipping = $settings->flat_rate_amount;
                break;

            case 'free_shipping_threshold':
                if ($subtotal >= $settings->free_shipping_threshold) {
                    $shipping = 0; // Free shipping
                } else {
                    $shipping = $settings->flat_rate_amount; // Use flat rate if below threshold
                }
                break;

            case 'weight_based':
                $shipping = $weight * $settings->weight_rate_per_kg;
                break;

            case 'distance_based':
                $shipping = $distance * $settings->distance_rate_per_km;
                break;
        }

        // Apply min/max limits
        if ($settings->min_shipping_charge > 0 && $shipping < $settings->min_shipping_charge) {
            $shipping = $settings->min_shipping_charge;
        }
        
        if ($settings->max_shipping_charge && $shipping > $settings->max_shipping_charge) {
            $shipping = $settings->max_shipping_charge;
        }

        return round($shipping, 2);
    }
}
