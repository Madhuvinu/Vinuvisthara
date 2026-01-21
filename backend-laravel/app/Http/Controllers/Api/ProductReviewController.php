<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductReviewController extends Controller
{
    public function index($productId)
    {
        $product = Product::findOrFail($productId);
        $reviews = $product->reviews()
            ->where('is_approved', true) // Only show approved reviews
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'customer_name' => $review->customer_name ?? ($review->customer ? $review->customer->email : 'Anonymous'),
                    'created_at' => $review->created_at->format('Y-m-d H:i:s'),
                    'is_featured' => $review->is_featured,
                ];
            });

        return response()->json([
            'reviews' => $reviews,
            'average_rating' => round($product->average_rating, 1),
            'total_reviews' => $product->total_reviews,
        ]);
    }

    public function store(Request $request, $productId)
    {
        $customer = $request->user();

        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'customer_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if customer already reviewed this product
        $existingReview = ProductReview::where('product_id', $productId)
            ->where('customer_id', $customer->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'error' => 'You have already reviewed this product',
            ], 400);
        }

        $review = ProductReview::create([
            'product_id' => $productId,
            'customer_id' => $customer->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'customer_name' => $request->customer_name ?? $customer->email,
            'is_approved' => false, // Requires admin approval
        ]);

        return response()->json([
            'message' => 'Review submitted successfully. It will be visible after approval.',
            'review' => $review,
        ], 201);
    }
}
