<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DiscountController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\ApiTokenController;
use App\Http\Controllers\Api\SliderController;
use App\Http\Controllers\Api\ProductReviewController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AdminAuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check (use for load balancers/uptime monitors)
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Admin authentication routes (public)
Route::post('/admin/auth/login', [AdminAuthController::class, 'login']);

// Slider Images (public)
Route::get('/slider-images', [SliderController::class, 'index']);
Route::get('/slider-images/{id}', [SliderController::class, 'show']);

// Products (public)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [ProductController::class, 'categories']);
Route::get('/collections', [ProductController::class, 'collections']);

// Product Reviews (public read, protected write)
Route::get('/products/{id}/reviews', [App\Http\Controllers\Api\ProductReviewController::class, 'index']);

// Blog (public)
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{id}', [BlogController::class, 'show']);

// Discounts (public)
Route::post('/coupons/apply', [DiscountController::class, 'applyCoupon']);
Route::post('/discounts/calculate', [DiscountController::class, 'calculate']);

// Guest cart (no auth required)
Route::post('/cart/guest/create', [CartController::class, 'createGuest']);
Route::post('/cart/guest/add', [CartController::class, 'addGuest']);
Route::get('/cart/guest/{sessionId}', [CartController::class, 'showGuest']);

// Protected routes (require customer authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Cart
    Route::post('/cart/create', [CartController::class, 'create']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::post('/cart/update', [CartController::class, 'update']);
    Route::get('/cart', [CartController::class, 'show']);
    Route::delete('/cart/remove', [CartController::class, 'remove']);
    Route::post('/cart/merge', [CartController::class, 'mergeGuestCart']);
    
    // Orders
    Route::post('/orders/create', [OrderController::class, 'create']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::get('/orders/{id}/invoice', [OrderController::class, 'downloadInvoice']);
    Route::get('/orders', [OrderController::class, 'userOrders']);
    
    // Payments
    Route::post('/payments/create-order', [PaymentController::class, 'createOrder']);
    Route::post('/payments/verify', [PaymentController::class, 'verify']);
    
    // Product Reviews
    Route::post('/products/{id}/reviews', [ProductReviewController::class, 'store']);
    
    // API Tokens
    Route::post('/tokens/create', [ApiTokenController::class, 'create']);
    Route::get('/tokens', [ApiTokenController::class, 'index']);
    Route::delete('/tokens/{id}', [ApiTokenController::class, 'revoke']);
});

// Admin routes (require admin authentication via Sanctum)
Route::middleware('auth:sanctum')->prefix('admin/auth')->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me', [AdminAuthController::class, 'me']);
});
