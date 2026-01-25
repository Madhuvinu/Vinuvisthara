<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SliderImageItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'slider_image_id',
        'image_url',
        'order',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function sliderImage(): BelongsTo
    {
        return $this->belongsTo(SliderImage::class);
    }
}
