<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SliderImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image_url',
        'link',
        'button_text',
        'button_text_color',
        'button_background_color',
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
