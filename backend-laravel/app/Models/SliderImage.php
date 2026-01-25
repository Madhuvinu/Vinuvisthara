<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SliderImage extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::updating(function (SliderImage $slider) {
            // Helper to check if Filament file upload is effectively empty
            $isEmpty = function ($value) {
                if ($value === null || $value === '') {
                    return true;
                }
                if (is_array($value)) {
                    // Check if it's Filament's empty array format: [[],{"s":"arr"}]
                    // Look for any string that's not empty
                    foreach ($value as $item) {
                        if (is_string($item) && trim($item) !== '') {
                            return false; // Has valid path
                        }
                        if (is_array($item) && !empty($item)) {
                            // Check nested array for strings
                            foreach ($item as $nested) {
                                if (is_string($nested) && trim($nested) !== '') {
                                    return false; // Has valid path
                                }
                            }
                        }
                    }
                    return true; // No valid paths found
                }
                return false;
            };

            // If image_url is empty or null, preserve existing value
            if ($slider->isDirty('image_url')) {
                $newValue = $slider->image_url;
                if ($isEmpty($newValue)) {
                    $original = $slider->getOriginal('image_url');
                    if ($original && !$isEmpty($original)) {
                        $slider->image_url = $original;
                    }
                }
            }

            // Same for mobile_image_url (can be null, so only preserve if exists)
            if ($slider->isDirty('mobile_image_url')) {
                $newMobileValue = $slider->mobile_image_url;
                if ($isEmpty($newMobileValue)) {
                    $originalMobile = $slider->getOriginal('mobile_image_url');
                    if ($originalMobile && !$isEmpty($originalMobile)) {
                        $slider->mobile_image_url = $originalMobile;
                    }
                }
            }
        });
    }

    protected $fillable = [
        'title',
        'description',
        'image_url',
        'object_fit',
        'object_position',
        'image_zoom',
        'mobile_object_fit',
        'mobile_object_position',
        'mobile_image_zoom',
        'mobile_image_url',
        'mobile_height',
        'mobile_padding_top',
        'mobile_padding_right',
        'mobile_padding_bottom',
        'mobile_padding_left',
        'mobile_margin_top',
        'mobile_margin_right',
        'mobile_margin_bottom',
        'mobile_margin_left',
        'mobile_full_width',
        'link',
        'button_text',
        'button_text_color',
        'button_background_color',
        'banner_text',
        'background_color',
        'gradient_color_1',
        'gradient_color_2',
        'gradient_color_3',
        'text_color',
        'header_color',
        'order',
        'is_active',
        'sparkle_effect_enabled',
        'sparkle_color',
        'sparkle_speed',
        'card_background_color',
        'card_background_gradient',
        'image_inner_background',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sparkle_effect_enabled' => 'boolean',
        'sparkle_speed' => 'integer',
        'image_zoom' => 'float',
        'mobile_image_zoom' => 'float',
        'mobile_height' => 'integer',
        'mobile_padding_top' => 'integer',
        'mobile_padding_right' => 'integer',
        'mobile_padding_bottom' => 'integer',
        'mobile_padding_left' => 'integer',
        'mobile_margin_top' => 'integer',
        'mobile_margin_right' => 'integer',
        'mobile_margin_bottom' => 'integer',
        'mobile_margin_left' => 'integer',
        'mobile_full_width' => 'boolean',
    ];

    // Accessor to get full image URL
    public function getImageUrlAttribute($value)
    {
        // Handle Filament file upload format (array) or string
        if (is_array($value)) {
            $value = !empty($value) ? $value[0] : null;
        }
        if ($value && !str_starts_with($value, 'http')) {
            return asset('storage/' . $value);
        }
        return $value;
    }

    // Accessor to get full mobile image URL
    public function getMobileImageUrlAttribute($value)
    {
        // Handle Filament file upload format (array) or string
        if (is_array($value)) {
            $value = !empty($value) ? $value[0] : null;
        }
        if ($value && !str_starts_with($value, 'http')) {
            return asset('storage/' . $value);
        }
        return $value;
    }

    // Get raw original value (for API)
    public function getRawOriginal($key = null, $default = null)
    {
        return parent::getRawOriginal($key, $default);
    }

    public function images(): HasMany
    {
        return $this->hasMany(SliderImageItem::class)->orderBy('order');
    }
}
