<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartController extends Controller
{
    public function create(Request $request)
    {
        $customer = $request->user();
        
        $cart = Cart::firstOrCreate(
            ['customer_id' => $customer->id],
            ['session_id' => null]
        );

        return response()->json($cart->load('items.product.images'));
    }

    public function createGuest(Request $request)
    {
        $sessionId = $request->session_id ?? Str::random(40);
        
        $cart = Cart::firstOrCreate(
            ['session_id' => $sessionId, 'customer_id' => null],
            []
        );

        // Format images for frontend
        $cart->load('items.product.images');
        if ($cart->items) {
            foreach ($cart->items as $item) {
                if ($item->product && $item->product->thumbnail) {
                    if (!filter_var($item->product->thumbnail, FILTER_VALIDATE_URL)) {
                        $imagePath = ltrim($item->product->thumbnail, '/');
                        $item->product->thumbnail = url('storage/' . $imagePath);
                    }
                }
            }
        }
        return response()->json([
            'cart' => $cart,
            'session_id' => $sessionId,
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $customer = $request->user();
        $cart = Cart::firstOrCreate(['customer_id' => $customer->id]);
        
        $product = Product::findOrFail($request->product_id);
        
        if ($product->stock < $request->quantity) {
            return response()->json(['error' => 'Insufficient stock'], 400);
        }

        // Use discounted price if discount is enabled, otherwise use regular price
        $unitPrice = $product->has_discount ? ($product->discounted_price ?? $product->price) : $product->price;

        $cartItem = CartItem::updateOrCreate(
            [
                'cart_id' => $cart->id,
                'product_id' => $request->product_id,
            ],
            [
                'quantity' => $request->quantity,
                'price' => $unitPrice,
            ]
        );

        $cart->recalculateTotal();

        // Format images for frontend
        $cart->load('items.product.images');
        if ($cart->items) {
            foreach ($cart->items as $item) {
                if ($item->product) {
                    if ($item->product->thumbnail && !filter_var($item->product->thumbnail, FILTER_VALIDATE_URL)) {
                        $imagePath = ltrim($item->product->thumbnail, '/');
                        $item->product->thumbnail = url('storage/' . $imagePath);
                    }
                }
            }
        }
        return response()->json($cart);
    }

    public function addGuest(Request $request)
    {
        $request->validate([
            'session_id' => 'required',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::firstOrCreate(
            ['session_id' => $request->session_id, 'customer_id' => null]
        );
        
        $product = Product::findOrFail($request->product_id);
        
        if ($product->stock < $request->quantity) {
            return response()->json(['error' => 'Insufficient stock'], 400);
        }

        // Use discounted price if discount is enabled, otherwise use regular price
        $unitPrice = $product->has_discount ? ($product->discounted_price ?? $product->price) : $product->price;

        $cartItem = CartItem::updateOrCreate(
            [
                'cart_id' => $cart->id,
                'product_id' => $request->product_id,
            ],
            [
                'quantity' => $request->quantity,
                'price' => $unitPrice,
            ]
        );

        $cart->recalculateTotal();

        // Format images for frontend
        $cart->load('items.product.images');
        if ($cart->items) {
            foreach ($cart->items as $item) {
                if ($item->product) {
                    if ($item->product->thumbnail && !filter_var($item->product->thumbnail, FILTER_VALIDATE_URL)) {
                        $imagePath = ltrim($item->product->thumbnail, '/');
                        $item->product->thumbnail = url('storage/' . $imagePath);
                    }
                }
            }
        }
        return response()->json([
            'cart' => $cart,
            'session_id' => $request->session_id,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:cart_items,id',
            'quantity' => 'required|integer|min:0',
        ]);

        $customer = $request->user();
        $cartItem = CartItem::whereHas('cart', function ($q) use ($customer) {
            $q->where('customer_id', $customer->id);
        })->with('product.images')->findOrFail($request->item_id);

        if ($request->quantity == 0) {
            $cartItem->delete();
        } else {
            $cartItem->quantity = $request->quantity;
            $cartItem->save();
        }

        $cart = $cartItem->cart;
        $cart->recalculateTotal();
        
        // Automatically apply discounts if eligible
        $this->applyAutoDiscounts($cart);

        return response()->json($cart->load('items.product.images'));
    }

    public function show(Request $request)
    {
        $customer = $request->user();
        $cart = Cart::with('items.product.images')->where('customer_id', $customer->id)->first();

        if (!$cart) {
            $cart = Cart::create(['customer_id' => $customer->id]);
        }

        // Automatically calculate and apply discounts if cart has items
        if ($cart && $cart->items && $cart->items->count() > 0) {
            $cart->recalculateTotal();
            
            // Apply automatic discounts (discounts with code = null)
            $this->applyAutoDiscounts($cart);
        }

        // Format product images for frontend
        if ($cart && $cart->items) {
            foreach ($cart->items as $item) {
                if ($item->product) {
                    // Format thumbnail
                    if ($item->product->thumbnail) {
                        if (!filter_var($item->product->thumbnail, FILTER_VALIDATE_URL)) {
                            $imagePath = ltrim($item->product->thumbnail, '/');
                            $item->product->thumbnail = url('storage/' . $imagePath);
                        }
                    }
                    
                    // Format product images - ensure they're returned as array with image_url
                    if ($item->product->images && $item->product->images->count() > 0) {
                        $item->product->formatted_images = $item->product->images->map(function ($image) {
                            $imageUrl = $image->image_url;
                            if (!filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                                $imagePath = ltrim($imageUrl, '/');
                                $imageUrl = url('storage/' . $imagePath);
                            }
                            return [
                                'image_url' => $imageUrl,
                                'id' => $image->id,
                                'is_primary' => $image->is_primary ?? false,
                            ];
                        })->toArray();
                    } else {
                        $item->product->formatted_images = [];
                    }
                }
            }
        }

        return response()->json($cart);
    }

    private function applyAutoDiscounts(Cart $cart)
    {
        // Only apply auto-discounts if no manual coupon code is applied
        if ($cart->coupon_code) {
            return;
        }

        $discountController = new \App\Http\Controllers\Api\DiscountController();
        
        // Get active auto-apply discounts (code = null)
        $autoDiscounts = Discount::where('is_active', true)
            ->whereNull('code') // Auto-apply discounts have no code
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->get();

        $bestDiscount = 0;
        $bestDiscountId = null;

        foreach ($autoDiscounts as $discount) {
            // Check if discount applies to this cart
            if ($this->discountAppliesToCart($discount, $cart)) {
                $discountAmount = $this->calculateDiscountAmount($discount, $cart);
                if ($discountAmount > $bestDiscount) {
                    $bestDiscount = $discountAmount;
                    $bestDiscountId = $discount->id;
                }
            }
        }

        // Apply the best discount
        if ($bestDiscount > 0) {
            $cart->discount = $bestDiscount;
            $cart->recalculateTotal();
        }
    }

    private function discountAppliesToCart($discount, Cart $cart)
    {
        // Check minimum order amount
        if ($discount->min_order_amount && $cart->subtotal < $discount->min_order_amount) {
            return false;
        }

        // Check apply_to rules
        if ($discount->apply_to === 'all') {
            return true;
        }

        // For specific categories/products/collections, check if cart items match
        if (in_array($discount->apply_to, ['categories', 'products', 'collections'])) {
            $applyToIds = $discount->apply_to_ids ?? [];
            if (empty($applyToIds)) {
                return false;
            }

            foreach ($cart->items as $item) {
                if ($discount->apply_to === 'categories' && in_array($item->product->category_id, $applyToIds)) {
                    return true;
                }
                if ($discount->apply_to === 'products' && in_array($item->product_id, $applyToIds)) {
                    return true;
                }
                if ($discount->apply_to === 'collections' && $item->product->collection_id && in_array($item->product->collection_id, $applyToIds)) {
                    return true;
                }
            }
            return false;
        }

        return true;
    }

    private function calculateDiscountAmount($discount, Cart $cart)
    {
        $subtotal = $cart->subtotal;

        // Check minimum order amount
        if ($discount->min_order_amount && $subtotal < $discount->min_order_amount) {
            return 0;
        }

        // Calculate discount
        if ($discount->type === 'percentage') {
            $discountAmount = ($subtotal * $discount->value) / 100;
        } else {
            $discountAmount = $discount->value;
        }

        // Apply max discount limit
        if ($discount->max_discount_amount && $discountAmount > $discount->max_discount_amount) {
            $discountAmount = $discount->max_discount_amount;
        }

        return round($discountAmount, 2);
    }

    public function showGuest($sessionId)
    {
        $cart = Cart::with('items.product')
            ->where('session_id', $sessionId)
            ->whereNull('customer_id')
            ->first();

        if (!$cart) {
            $cart = Cart::create(['session_id' => $sessionId]);
        }

        return response()->json($cart);
    }

    public function remove(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:cart_items,id',
        ]);

        $customer = $request->user();
        $cartItem = CartItem::whereHas('cart', function ($q) use ($customer) {
            $q->where('customer_id', $customer->id);
        })->with('product.images')->findOrFail($request->item_id);

        $cart = $cartItem->cart;
        $cartItem->delete();
        $cart->recalculateTotal();
        
        // Automatically apply discounts if eligible
        $this->applyAutoDiscounts($cart);

        return response()->json($cart->load('items.product.images'));
    }

    public function mergeGuestCart(Request $request)
    {
        $request->validate([
            'session_id' => 'required',
        ]);

        $customer = $request->user();
        
        // Get guest cart
        $guestCart = Cart::with('items')
            ->where('session_id', $request->session_id)
            ->whereNull('customer_id')
            ->first();

        if (!$guestCart || $guestCart->items->isEmpty()) {
            return response()->json(['message' => 'No guest cart to merge']);
        }

        // Get or create customer cart
        $customerCart = Cart::firstOrCreate(['customer_id' => $customer->id]);

        // Merge items
        foreach ($guestCart->items as $guestItem) {
            $existingItem = CartItem::where('cart_id', $customerCart->id)
                ->where('product_id', $guestItem->product_id)
                ->first();

            if ($existingItem) {
                $existingItem->quantity += $guestItem->quantity;
                $existingItem->save();
            } else {
                CartItem::create([
                    'cart_id' => $customerCart->id,
                    'product_id' => $guestItem->product_id,
                    'quantity' => $guestItem->quantity,
                    'price' => $guestItem->price,
                ]);
            }
        }

        $customerCart->recalculateTotal();
        
        // Delete guest cart
        $guestCart->delete();

        return response()->json([
            'message' => 'Cart merged successfully',
            'cart' => $customerCart->load('items.product'),
        ]);
    }
}
