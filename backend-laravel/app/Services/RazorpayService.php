<?php

namespace App\Services;

use Razorpay\Api\Api;
use Illuminate\Support\Facades\Log;

class RazorpayService
{
    private $api;

    public function __construct()
    {
        $keyId = config('services.razorpay.key');
        $keySecret = config('services.razorpay.secret');
        
        if (!$keyId || !$keySecret) {
            throw new \Exception('Razorpay credentials not configured');
        }
        
        $this->api = new Api($keyId, $keySecret);
    }

    public function createOrder(array $data)
    {
        try {
            $order = $this->api->order->create([
                'receipt' => $data['receipt'],
                'amount' => $data['amount'] * 100, // Convert to paise
                'currency' => $data['currency'] ?? 'INR',
                'notes' => $data['notes'] ?? [],
            ]);

            return [
                'id' => $order['id'],
                'amount' => $order['amount'],
                'currency' => $order['currency'],
                'receipt' => $order['receipt'],
            ];
        } catch (\Exception $e) {
            Log::error('Razorpay order creation failed: ' . $e->getMessage());
            throw new \Exception('Failed to create Razorpay order: ' . $e->getMessage());
        }
    }

    public function verifyPayment(array $attributes)
    {
        try {
            $signature = $attributes['razorpay_signature'];
            $orderId = $attributes['razorpay_order_id'];
            $paymentId = $attributes['razorpay_payment_id'];

            $attributes = [
                'razorpay_order_id' => $orderId,
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => $signature,
            ];

            $this->api->utility->verifyPaymentSignature($attributes);
            
            return [
                'success' => true,
                'payment_id' => $paymentId,
                'order_id' => $orderId,
            ];
        } catch (\Exception $e) {
            Log::error('Razorpay payment verification failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function fetchPayment($paymentId)
    {
        try {
            $payment = $this->api->payment->fetch($paymentId);
            return $payment->toArray();
        } catch (\Exception $e) {
            Log::error('Razorpay payment fetch failed: ' . $e->getMessage());
            throw new \Exception('Failed to fetch payment: ' . $e->getMessage());
        }
    }
}
