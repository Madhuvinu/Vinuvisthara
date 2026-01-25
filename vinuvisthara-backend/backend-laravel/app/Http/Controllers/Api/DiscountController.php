<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Discount;
use App\Models\Cart;
use Illuminate\Http\Request;

class DiscountController extends Controller
{
    public function applyCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'cart_id' => 'nullable|exists:carts,id',
        ]);

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon || !$coupon->isValid()) {
            return response()->json(['error' => 'Invalid or expired coupon'], 400);
        }

        // Check if user already used this coupon (if single use)
        if ($coupon->single_use && $request->user()) {
            $used = $coupon->usages()->where('user_id', $request->user()->id)->exists();
            if ($used) {
                return response()->json(['error' => 'Coupon already used'], 400);
            }
        }

        return response()->json([
            'coupon' => $coupon,
            'discount' => $this->calculateDiscount($coupon, $request->cart_id),
        ]);
    }

    public function calculate(Request $request)
    {
        $request->validate([
            'cart_id' => 'required|exists:carts,id',
            'coupon_code' => 'nullable|string',
        ]);

        $cart = Cart::with('items.product')->findOrFail($request->cart_id);
        $discount = 0;

        if ($request->coupon_code) {
            $coupon = Coupon::where('code', $request->coupon_code)->first();
            if ($coupon && $coupon->isValid()) {
                $discount = $this->calculateDiscount($coupon, $cart->id);
            }
        }

        // Apply automatic discounts
        $autoDiscounts = Discount::where('is_active', true)
            ->where('code', null) // Auto-apply discounts
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->get();

        foreach ($autoDiscounts as $autoDiscount) {
            $autoDiscountAmount = $this->calculateDiscountAmount($autoDiscount, $cart);
            if ($autoDiscountAmount > $discount) {
                $discount = $autoDiscountAmount;
            }
        }

        $cart->discount = $discount;
        $cart->coupon_code = $request->coupon_code;
        $cart->recalculateTotal();

        return response()->json([
            'discount' => $discount,
            'cart' => $cart,
        ]);
    }

    private function calculateDiscount($coupon, $cartId)
    {
        if (!$cartId) {
            return 0;
        }

        $cart = Cart::with('items.product')->find($cartId);
        if (!$cart) {
            return 0;
        }

        return $this->calculateDiscountAmount($coupon, $cart);
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
}
