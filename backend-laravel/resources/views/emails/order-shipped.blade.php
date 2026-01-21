<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Shipped</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #1f2937; margin: 0 0 10px 0;">Your Order Has Been Shipped! 🚚</h1>
        <p style="margin: 0; color: #6b7280;">Your order is on its way to you.</p>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Shipping Information</h2>
        <p><strong>Order Number:</strong> {{ $order->order_number }}</p>
        @if($order->tracking_number)
        <p><strong>Tracking Number:</strong> {{ $order->tracking_number }}</p>
        @endif
        @if($order->carrier)
        <p><strong>Carrier:</strong> {{ $order->carrier }}</p>
        @endif
        <p><strong>Shipped Date:</strong> {{ $order->shipped_at ? $order->shipped_at->format('F d, Y h:i A') : 'N/A' }}</p>
    </div>

    @if($order->tracking_number)
    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border: 1px solid #bfdbfe; margin-bottom: 20px; text-align: center;">
        <p style="margin: 0; font-size: 1.1em;"><strong>Track your order:</strong></p>
        <p style="margin: 10px 0 0 0; font-size: 1.2em; color: #1e40af;">{{ $order->tracking_number }}</p>
    </div>
    @endif

    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Shipping Address</h2>
        @if($order->shipping_address)
        <p style="margin: 5px 0;">{{ $order->shipping_address['address'] ?? '' }}</p>
        <p style="margin: 5px 0;">{{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['state'] ?? '' }} - {{ $order->shipping_address['pincode'] ?? '' }}</p>
        <p style="margin: 5px 0;">Phone: {{ $order->shipping_address['phone'] ?? '' }}</p>
        @endif
    </div>

    <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 0.9em;">
        <p>Thank you for shopping with Vinu Visthara!</p>
        <p>Your order should arrive soon. If you have any questions, please contact us.</p>
    </div>
</body>
</html>
