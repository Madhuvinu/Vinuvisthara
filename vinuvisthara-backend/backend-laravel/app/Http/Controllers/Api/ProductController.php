<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Collection;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['images', 'category', 'collection', 'tags'])
            ->where('status', 'published');

        // Filter by category
        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Filter by collection
        if ($request->has('collection_id')) {
            $query->where('collection_id', $request->collection_id);
        }

        // Filter by tags (color, fabric, occasion)
        if ($request->has('color')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('type', 'color')->where('slug', $request->color);
            });
        }

        if ($request->has('fabric')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('type', 'fabric')->where('slug', $request->fabric);
            });
        }

        if ($request->has('occasion')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('type', 'occasion')->where('slug', $request->occasion);
            });
        }

        // Price range
        if ($request->has('minPrice')) {
            $query->where('price', '>=', $request->minPrice * 100);
        }

        if ($request->has('maxPrice')) {
            $query->where('price', '<=', $request->maxPrice * 100);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Pagination
        $perPage = $request->get('limit', 20);
        $products = $query->paginate($perPage);

        // Format products with proper image URLs
        $formattedProducts = collect($products->items())->map(function ($product) {
            // Format thumbnail URL
            $thumbnailUrl = null;
            if ($product->thumbnail) {
                if (filter_var($product->thumbnail, FILTER_VALIDATE_URL)) {
                    $thumbnailUrl = $product->thumbnail;
                } else {
                    $imagePath = ltrim($product->thumbnail, '/');
                    $thumbnailUrl = url('storage/' . $imagePath);
                }
            }

            // Format product images
            $formattedImages = $product->images->map(function ($image) {
                if (filter_var($image->image_url, FILTER_VALIDATE_URL)) {
                    return $image->image_url;
                } else {
                    $imagePath = ltrim($image->image_url, '/');
                    return url('storage/' . $imagePath);
                }
            })->toArray();

            // Convert to array and update image URLs
            $productArray = $product->toArray();
            $productArray['thumbnail'] = $thumbnailUrl;
            $productArray['images'] = $formattedImages;
            
            // Ensure compare_at_price is included (MRP) - convert to float
            $productArray['compare_at_price'] = $product->compare_at_price ? (float) $product->compare_at_price : null;
            
            // Add discount and rating information
            $productArray['has_discount'] = $product->has_discount ?? false;
            $productArray['discount_percentage'] = $product->discount_percentage ? (float) $product->discount_percentage : 0;
            $productArray['discount_amount'] = $product->discount_amount ? (float) $product->discount_amount : 0;
            // Get discounted price using the accessor (handles date validation)
            $productArray['discounted_price'] = $product->discounted_price ? (float) $product->discounted_price : (float) $product->price;
            // Ensure price is also a float
            $productArray['price'] = (float) $product->price;
            $productArray['offer_text'] = $product->offer_text;
            $productArray['average_rating'] = round($product->average_rating ?? 0, 1);
            $productArray['total_reviews'] = $product->total_reviews ?? 0;

            return $productArray;
        });

        return response()->json([
            'products' => $formattedProducts,
            'count' => $products->total(),
            'pagination' => [
                'page' => $products->currentPage(),
                'limit' => $products->perPage(),
                'total' => $products->total(),
                'totalPages' => $products->lastPage(),
            ],
        ]);
    }

    public function show($id)
    {
        $product = Product::with(['images', 'category', 'collection', 'tags'])
            ->where('status', 'published')
            ->findOrFail($id);

        // Format thumbnail URL
        $thumbnailUrl = null;
        if ($product->thumbnail) {
            if (filter_var($product->thumbnail, FILTER_VALIDATE_URL)) {
                $thumbnailUrl = $product->thumbnail;
            } else {
                $imagePath = ltrim($product->thumbnail, '/');
                $thumbnailUrl = url('storage/' . $imagePath);
            }
        }

        // Format product images
        $formattedImages = $product->images->map(function ($image) {
            if (filter_var($image->image_url, FILTER_VALIDATE_URL)) {
                return $image->image_url;
            } else {
                $imagePath = ltrim($image->image_url, '/');
                return url('storage/' . $imagePath);
            }
        })->toArray();

        // Convert to array and update image URLs
        $productArray = $product->toArray();
        $productArray['thumbnail'] = $thumbnailUrl;
        $productArray['images'] = $formattedImages;
        
        // Ensure compare_at_price is included (MRP) - convert to float
        $productArray['compare_at_price'] = $product->compare_at_price ? (float) $product->compare_at_price : null;
        
        // Add discount and rating information
        $productArray['has_discount'] = $product->has_discount ?? false;
        $productArray['discount_percentage'] = $product->discount_percentage ? (float) $product->discount_percentage : 0;
        $productArray['discount_amount'] = $product->discount_amount ? (float) $product->discount_amount : 0;
        // Get discounted price using the accessor (handles date validation)
        $productArray['discounted_price'] = $product->discounted_price ? (float) $product->discounted_price : (float) $product->price;
        // Ensure price is also a float
        $productArray['price'] = (float) $product->price;
        $productArray['offer_text'] = $product->offer_text;
        $productArray['average_rating'] = round($product->average_rating ?? 0, 1);
        $productArray['total_reviews'] = $product->total_reviews ?? 0;
        
        // Load reviews for product detail page
        $productArray['reviews'] = $product->reviews()
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'customer_name' => $review->customer_name ?? $review->customer->email,
                    'created_at' => $review->created_at,
                ];
            });

        return response()->json(['product' => $productArray]);
    }

    public function categories()
    {
        $categories = Category::where('is_active', true)
            ->orderBy('order')
            ->get()
            ->map(function ($category) {
                // Format image URL if it exists
                $imageUrl = null;
                if ($category->image) {
                    // If image is already a full URL, use it; otherwise prepend storage path
                    if (filter_var($category->image, FILTER_VALIDATE_URL)) {
                        $imageUrl = $category->image;
                    } else {
                        // Remove leading slash if present
                        $imagePath = ltrim($category->image, '/');
                        $imageUrl = url('storage/' . $imagePath);
                    }
                }

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'image' => $imageUrl,
                    'card_width' => $category->card_width,
                    'card_height' => $category->card_height,
                    'image_fit' => $category->image_fit ?? 'cover',
                    'image_position' => $category->image_position ?? 'center',
                    'image_scale' => $category->image_scale ?? 1.0,
                    'image_align_horizontal' => $category->image_align_horizontal ?? 'center',
                    'image_align_vertical' => $category->image_align_vertical ?? 'center',
                    'image_offset_x' => $category->image_offset_x ?? 0,
                    'image_offset_y' => $category->image_offset_y ?? 0,
                    'spacing' => $category->spacing ?? 16,
                    'aspect_ratio' => $category->aspect_ratio ?? '4:5',
                    'order' => $category->order,
                    'is_active' => $category->is_active,
                ];
            });

        // Get collections section background settings
        $settings = \App\Models\CollectionsSetting::getSettings();
        $backgroundColor = $settings->section_background_color ?? '#FBF6F1';
        $backgroundGradient = $settings->section_background_gradient ?? null;

        return response()->json([
            'categories' => $categories,
            'section_background' => [
                'color' => $backgroundColor,
                'gradient' => $backgroundGradient,
            ],
        ]);
    }

    public function collections()
    {
        $collections = Collection::where('is_active', true)->get();

        return response()->json($collections);
    }
}
