<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'shippingAddress' => 'required|array',
            'shippingAddress.address' => 'required|string',
            'shippingAddress.city' => 'required|string',
            'shippingAddress.state' => 'required|string',
            'shippingAddress.pincode' => 'required|string',
            'shippingAddress.phone' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $customer = $request->user();
        $cart = Cart::with('items.product')->where('customer_id', $customer->id)->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['error' => 'Cart is empty'], 400);
        }

        // Validate stock
        foreach ($cart->items as $item) {
            if ($item->product->stock < $item->quantity) {
                return response()->json([
                    'error' => "Insufficient stock for {$item->product->name}",
                ], 400);
            }
        }

        DB::beginTransaction();
        try {
            // Calculate totals with product-specific tax rates
            $subtotal = $cart->subtotal;
            
            // Calculate shipping using ShippingSettings
            $state = $request->shippingAddress['state'] ?? null;
            $city = $request->shippingAddress['city'] ?? null;
            $shipping = \App\Models\ShippingSettings::calculateShipping($subtotal, 0, 0, $state, $city);
            
            // Calculate tax based on each product's tax rate
            $tax = 0;
            foreach ($cart->items as $item) {
                if ($item->product) {
                    $productTaxRate = $item->product->tax_rate ?? 18.00; // Default to 18% if not set
                    $itemTax = ($item->total * $productTaxRate) / 100;
                    $tax += $itemTax;
                }
            }
            
            // If no items or no products, use default 18% on subtotal
            if ($tax == 0 && $subtotal > 0) {
                $tax = $subtotal * 0.18;
            }
            
            $tax = round($tax, 2);
            $total = $subtotal + $shipping + $tax - ($cart->discount ?? 0);

            // Create order
            $order = Order::create([
                'customer_id' => $customer->id,
                'status' => 'pending',
                'fulfillment_status' => 'pending',
                'payment_status' => 'pending',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping' => $shipping,
                'discount' => $cart->discount ?? 0,
                'total' => $total,
                'coupon_code' => $cart->coupon_code,
                'shipping_address' => $request->shippingAddress,
                'notes' => $request->notes,
            ]);

            // Create order items and update stock
            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'product_sku' => $item->product->sku,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total' => $item->total,
                ]);

                // Update stock
                $item->product->decrement('stock', $item->quantity);
            }

            // Clear cart
            $cart->items()->delete();
            $cart->delete();

            DB::commit();

            // Send order confirmation email
            try {
                \Mail::to($customer->email)->send(new \App\Mail\OrderConfirmationMail($order));
            } catch (\Exception $e) {
                // Log error but don't fail the order
                \Log::error('Failed to send order confirmation email: ' . $e->getMessage());
            }

            return response()->json([
                'id' => $order->id,
                'orderNumber' => $order->order_number,
                'status' => $order->status,
                'total' => $order->total,
                'subtotal' => $order->subtotal,
                'tax' => $order->tax,
                'shipping' => $order->shipping,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create order'], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $customer = $request->user();
        $order = Order::with(['items.product', 'payments'])
            ->where('customer_id', $customer->id)
            ->findOrFail($id);

        return response()->json([
            'id' => $order->id,
            'order_number' => $order->order_number,
            'orderNumber' => $order->order_number,
            'status' => $order->status,
            'fulfillment_status' => $order->fulfillment_status,
            'payment_status' => $order->payment_status,
            'paymentStatus' => $order->payment_status,
            'total' => $order->total,
            'subtotal' => $order->subtotal,
            'shipping' => $order->shipping,
            'tax' => $order->tax,
            'items' => $order->items,
            'shipping_address' => $order->shipping_address,
            'shippingAddress' => $order->shipping_address,
            'tracking_number' => $order->tracking_number,
            'carrier' => $order->carrier,
            'shipped_at' => $order->shipped_at,
            'delivered_at' => $order->delivered_at,
            'notes' => $order->notes,
            'created_at' => $order->created_at,
            'createdAt' => $order->created_at,
        ]);
    }

    public function userOrders(Request $request)
    {
        $customer = $request->user();
        $orders = Order::with('items')
            ->where('customer_id', $customer->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders->map(function ($order) {
            return [
                'id' => $order->id,
                'orderNumber' => $order->order_number,
                'status' => $order->status,
                'paymentStatus' => $order->payment_status,
                'total' => $order->total,
                'subtotal' => $order->subtotal,
                'shipping' => $order->shipping,
                'tax' => $order->tax,
                'createdAt' => $order->created_at,
                'items' => $order->items,
            ];
        }));
    }

    public function downloadInvoice(Request $request, $id)
    {
        $customer = $request->user();
        $order = Order::with(['items.product', 'customer'])
            ->where('customer_id', $customer->id)
            ->findOrFail($id);

        $data = [
            'order' => $order,
            'order_number' => $order->order_number,
            'created_at' => $order->created_at,
            'shipping_address' => $order->shipping_address,
            'items' => $order->items,
            'subtotal' => $order->subtotal,
            'tax' => $order->tax,
            'shipping' => $order->shipping,
            'discount' => $order->discount ?? 0,
            'total' => $order->total,
            'payment_status' => $order->payment_status,
            'status' => $order->status,
        ];

        $pdf = Pdf::loadView('emails.invoice-pdf', $data);
        
        return $pdf->download("invoice-{$order->order_number}.pdf");
    }
}
