<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Cart;
use App\Services\RazorpayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $razorpayService;

    public function __construct(RazorpayService $razorpayService)
    {
        $this->razorpayService = $razorpayService;
    }

    public function createOrder(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $customer = $request->user();
        $order = Order::where('customer_id', $customer->id)
            ->where('id', $request->order_id)
            ->firstOrFail();

        if ($order->payment_status === 'paid') {
            return response()->json(['error' => 'Order already paid'], 400);
        }

        try {
            $razorpayOrder = $this->razorpayService->createOrder([
                'receipt' => $order->order_number,
                'amount' => (float) $order->total,
                'currency' => 'INR',
                'notes' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_id' => $customer->id,
                ],
            ]);

            // Store payment record
            Payment::create([
                'order_id' => $order->id,
                'payment_method' => 'razorpay',
                'transaction_id' => $razorpayOrder['id'],
                'amount' => $order->total,
                'status' => 'pending',
                'metadata' => [
                    'razorpay_order_id' => $razorpayOrder['id'],
                ],
            ]);

            return response()->json([
                'order_id' => $razorpayOrder['id'],
                'amount' => $razorpayOrder['amount'],
                'currency' => $razorpayOrder['currency'],
                'key' => config('services.razorpay.key'),
            ]);
        } catch (\Exception $e) {
            Log::error('Payment order creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create payment order'], 500);
        }
    }

    public function verify(Request $request)
    {
        $request->validate([
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
            'order_id' => 'required|exists:orders,id',
        ]);

        $customer = $request->user();
        $order = Order::with('items')->where('customer_id', $customer->id)
            ->where('id', $request->order_id)
            ->firstOrFail();

        $verification = $this->razorpayService->verifyPayment([
            'razorpay_order_id' => $request->razorpay_order_id,
            'razorpay_payment_id' => $request->razorpay_payment_id,
            'razorpay_signature' => $request->razorpay_signature,
        ]);

        DB::beginTransaction();
        try {
            if ($verification['success']) {
                // Update payment record
                $payment = Payment::where('order_id', $order->id)
                    ->where('transaction_id', $request->razorpay_order_id)
                    ->firstOrFail();

                $payment->update([
                    'transaction_id' => $request->razorpay_payment_id,
                    'status' => 'completed',
                    'metadata' => array_merge($payment->metadata ?? [], [
                        'razorpay_payment_id' => $request->razorpay_payment_id,
                        'verified_at' => now()->toDateTimeString(),
                    ]),
                ]);

                // Update order
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed',
                ]);

                // Clear cart
                $cart = Cart::where('customer_id', $customer->id)->first();
                if ($cart) {
                    $cart->items()->delete();
                    $cart->delete();
                }

                // Send order confirmation email
                try {
                    \Mail::to($customer->email)->send(new \App\Mail\OrderConfirmationMail($order));
                } catch (\Exception $e) {
                    Log::error('Failed to send order confirmation email: ' . $e->getMessage());
                }

                DB::commit();

                // Optionally auto-create Shiprocket order when payment is confirmed
                if (config('services.shiprocket.auto_create_on_confirmed', false)) {
                    try {
                        $shiprocket = app(\App\Services\ShiprocketService::class);
                        if ($shiprocket->isConfigured()) {
                            $order->refresh();
                            $data = $shiprocket->createOrderAndAssignAwb($order);
                            $order->update(array_merge($data, [
                                'tracking_number' => $data['shiprocket_awb'],
                                'carrier' => $data['carrier'] ?? $order->carrier,
                                'fulfillment_status' => 'processing',
                                'processed_at' => now(),
                            ]));
                        }
                    } catch (\Exception $e) {
                        Log::error('Shiprocket auto-create on confirm failed: ' . $e->getMessage());
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Payment verified successfully',
                    'order' => [
                        'id' => $order->id,
                        'orderNumber' => $order->order_number,
                        'status' => $order->status,
                        'paymentStatus' => $order->payment_status,
                    ],
                ]);
            } else {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'error' => $verification['error'] ?? 'Payment verification failed',
                ], 400);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment verification error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to verify payment',
            ], 500);
        }
    }
}
