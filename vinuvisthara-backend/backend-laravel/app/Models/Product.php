<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'sku',
        'price',
        'compare_at_price',
        'tax_rate',
        'discount_percentage',
        'discount_amount',
        'has_discount',
        'discount_starts_at',
        'discount_ends_at',
        'offer_text',
        'stock',
        'low_stock_threshold',
        'status',
        'is_featured',
        'thumbnail',
        'category_id',
        'collection_id',
        'metadata',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'has_discount' => 'boolean',
        'discount_starts_at' => 'datetime',
        'discount_ends_at' => 'datetime',
        'metadata' => 'array',
        'is_featured' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('order');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class)->where('is_approved', true);
    }

    public function allReviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function getPrimaryImageAttribute(): ?string
    {
        $primary = $this->images()->where('is_primary', true)->first();
        return $primary ? $primary->image_url : ($this->thumbnail ?? $this->images()->first()?->image_url);
    }

    public function getAverageRatingAttribute(): float
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    public function getTotalReviewsAttribute(): int
    {
        return $this->reviews()->count();
    }

    public function getDiscountedPriceAttribute(): float
    {
        if (!$this->has_discount) {
            return $this->price;
        }

        // Check if discount is active
        $now = now();
        if ($this->discount_starts_at && $now < $this->discount_starts_at) {
            return $this->price;
        }
        if ($this->discount_ends_at && $now > $this->discount_ends_at) {
            return $this->price;
        }

        // Calculate discount
        if ($this->discount_percentage > 0) {
            $discount = ($this->price * $this->discount_percentage) / 100;
            return max(0, $this->price - $discount);
        } elseif ($this->discount_amount > 0) {
            return max(0, $this->price - $this->discount_amount);
        }

        return $this->price;
    }
}
