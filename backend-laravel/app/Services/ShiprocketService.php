<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShiprocketService
{
    private string $baseUrl;
    private float $defaultWeightKg;
    private ?string $channelId;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.shiprocket.base_url', 'https://apiv2.shiprocket.in'), '/');
        $this->defaultWeightKg = config('services.shiprocket.default_weight_kg', 0.5);
        $this->channelId = config('services.shiprocket.channel_id') ?: null;
    }

    public function isConfigured(): bool
    {
        return ! empty(config('services.shiprocket.email')) && ! empty(config('services.shiprocket.password'));
    }

    private function ensureConfigured(): void
    {
        if (! $this->isConfigured()) {
            throw new \Exception('Shiprocket credentials not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env');
        }
    }

    /**
     * Get auth token (cached for 240 hours / 10 days).
     */
    public function getToken(): string
    {
        $this->ensureConfigured();
        $cacheKey = 'shiprocket_token';

        return Cache::remember($cacheKey, 240 * 60, function () {
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->post($this->baseUrl . '/v1/external/auth/login', [
                    'email' => config('services.shiprocket.email'),
                    'password' => config('services.shiprocket.password'),
                ]);

            if (! $response->successful()) {
                Log::error('Shiprocket auth failed', ['body' => $response->body()]);
                throw new \Exception('Shiprocket authentication failed: ' . $response->body());
            }

            $data = $response->json();
            $token = $data['token'] ?? null;

            if (! $token) {
                throw new \Exception('Shiprocket did not return a token.');
            }

            return $token;
        });
    }

    /**
     * Create order on Shiprocket (adhoc). Returns ['order_id' => x, 'shipment_id' => x] or throws.
     */
    public function createOrder(Order $order): array
    {
        $order->load(['customer', 'items']);

        $addr = $order->shipping_address ?? [];
        $customer = $order->customer;
        $firstName = $customer->first_name ? trim($customer->first_name) : 'Customer';
        $lastName = $customer->last_name ? trim($customer->last_name) : '';

        $paymentMethod = strtolower($order->payment_status ?? '') === 'paid' ? 'prepaid' : 'cod';

        $orderItems = [];
        foreach ($order->items as $item) {
            $orderItems[] = [
                'name' => $item->product_name,
                'sku' => $item->product_sku ?? 'SKU-' . $item->product_id,
                'units' => (int) $item->quantity,
                'selling_price' => (float) $item->price,
            ];
        }

        $weight = max($this->defaultWeightKg, 0.5);
        $payload = [
            'order_id' => $order->order_number,
            'order_date' => $order->created_at->format('Y-m-d H:i:s'),
            'channel_id' => $this->channelId ?: '',
            'billing_customer_name' => $firstName,
            'billing_last_name' => $lastName,
            'billing_address' => $addr['address'] ?? '',
            'billing_address_2' => '',
            'billing_city' => $addr['city'] ?? '',
            'billing_pincode' => $addr['pincode'] ?? '',
            'billing_state' => $addr['state'] ?? '',
            'billing_country' => 'India',
            'billing_email' => $addr['email'] ?? $order->customer->email,
            'billing_phone' => $addr['phone'] ?? $order->customer->phone ?? '',
            'shipping_is_billing' => true,
            'shipping_customer_name' => $firstName,
            'shipping_last_name' => $lastName,
            'shipping_address' => $addr['address'] ?? '',
            'shipping_address_2' => '',
            'shipping_city' => $addr['city'] ?? '',
            'shipping_pincode' => $addr['pincode'] ?? '',
            'shipping_state' => $addr['state'] ?? '',
            'shipping_country' => 'India',
            'shipping_email' => $addr['email'] ?? $order->customer->email,
            'shipping_phone' => $addr['phone'] ?? $order->customer->phone ?? '',
            'order_items' => $orderItems,
            'payment_method' => $paymentMethod,
            'sub_total' => (float) $order->subtotal,
            'length' => 10,
            'breadth' => 10,
            'height' => 5,
            'weight' => $weight,
            'pickup_location' => 'Primary',
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $this->getToken(),
        ])->post($this->baseUrl . '/v1/external/orders/create/adhoc', $payload);

        if (! $response->successful()) {
            Log::error('Shiprocket create order failed', [
                'order_id' => $order->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Shiprocket create order failed: ' . $response->body());
        }

        $data = $response->json();
        $srOrderId = $data['order_id'] ?? null;
        $shipmentId = null;

        if (isset($data['shipment_id'])) {
            $shipmentId = (string) $data['shipment_id'];
        } elseif (isset($data['shipments'][0]['id'])) {
            $shipmentId = (string) $data['shipments'][0]['id'];
        }

        if (! $srOrderId || ! $shipmentId) {
            throw new \Exception('Shiprocket did not return order_id or shipment_id. Response: ' . json_encode($data));
        }

        return [
            'order_id' => (string) $srOrderId,
            'shipment_id' => $shipmentId,
        ];
    }

    /**
     * Assign AWB to a shipment. Returns ['awb_code' => x, 'courier_name' => x].
     */
    public function assignAwb(int|string $shipmentId): array
    {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $this->getToken(),
        ])->post($this->baseUrl . '/v1/external/courier/assign/awb', [
            'shipment_id' => $shipmentId,
        ]);

        if (! $response->successful()) {
            Log::error('Shiprocket assign AWB failed', ['shipment_id' => $shipmentId, 'body' => $response->body()]);
            throw new \Exception('Shiprocket assign AWB failed: ' . $response->body());
        }

        $data = $response->json();
        $awb = $data['awb_code'] ?? $data['data']['awb_code'] ?? null;
        $courier = $data['courier_name'] ?? $data['data']['courier_name'] ?? null;

        if (! $awb) {
            throw new \Exception('Shiprocket did not return AWB. Response: ' . json_encode($data));
        }

        return [
            'awb_code' => (string) $awb,
            'courier_name' => $courier ? (string) $courier : null,
        ];
    }

    /**
     * Request pickup for given shipment IDs.
     */
    public function generatePickup(array $shipmentIds): array
    {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $this->getToken(),
        ])->post($this->baseUrl . '/v1/external/courier/generate/pickup', [
            'shipment_id' => $shipmentIds,
        ]);

        if (! $response->successful()) {
            Log::error('Shiprocket generate pickup failed', ['body' => $response->body()]);
            throw new \Exception('Shiprocket generate pickup failed: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Generate label PDF for a shipment. Returns URL or array with label url.
     */
    public function generateLabel(int|string $shipmentId): array
    {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $this->getToken(),
        ])->post($this->baseUrl . '/v1/external/courier/generate/label', [
            'shipment_id' => [$shipmentId],
        ]);

        if (! $response->successful()) {
            Log::error('Shiprocket generate label failed', ['shipment_id' => $shipmentId, 'body' => $response->body()]);
            throw new \Exception('Shiprocket generate label failed: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Cancel a Shiprocket order (for returns/cancellations). Use order_id from Shiprocket (our order_number or their id).
     */
    public function cancelOrder(int|string $shiprocketOrderId): array
    {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $this->getToken(),
        ])->post($this->baseUrl . '/v1/external/orders/cancel', [
            'ids' => [is_array($shiprocketOrderId) ? $shiprocketOrderId : [$shiprocketOrderId]],
        ]);

        if (! $response->successful()) {
            Log::warning('Shiprocket cancel order failed', ['order_id' => $shiprocketOrderId, 'body' => $response->body()]);
            throw new \Exception('Shiprocket cancel order failed: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Create Shiprocket order + assign AWB and return data for saving to Order.
     */
    public function createOrderAndAssignAwb(Order $order): array
    {
        $created = $this->createOrder($order);
        $awbResult = $this->assignAwb($created['shipment_id']);

        return [
            'shiprocket_order_id' => $created['order_id'],
            'shiprocket_shipment_id' => $created['shipment_id'],
            'shiprocket_awb' => $awbResult['awb_code'],
            'carrier' => $awbResult['courier_name'],
        ];
    }
}
