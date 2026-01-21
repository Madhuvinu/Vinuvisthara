<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #1f2937; margin: 0 0 10px 0;">Order Confirmation</h1>
        <p style="margin: 0; color: #6b7280;">Thank you for your order!</p>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Order Details</h2>
        <p><strong>Order Number:</strong> {{ $order->order_number }}</p>
        <p><strong>Order Date:</strong> {{ $order->created_at->format('F d, Y h:i A') }}</p>
        <p><strong>Status:</strong> {{ ucfirst($order->status) }}</p>
        <p><strong>Payment Status:</strong> {{ ucfirst($order->payment_status) }}</p>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Order Items</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 2px solid #e5e7eb;">
                    <th style="text-align: left; padding: 10px 0;">Product</th>
                    <th style="text-align: right; padding: 10px 0;">Quantity</th>
                    <th style="text-align: right; padding: 10px 0;">Price</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px 0;">{{ $item->product_name }}</td>
                    <td style="text-align: right; padding: 10px 0;">{{ $item->quantity }}</td>
                    <td style="text-align: right; padding: 10px 0;">₹{{ number_format($item->total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Order Summary</h2>
        <table style="width: 100%;">
            <tr>
                <td style="padding: 5px 0;">Subtotal:</td>
                <td style="text-align: right; padding: 5px 0;">₹{{ number_format($order->subtotal, 2) }}</td>
            </tr>
            <tr>
                <td style="padding: 5px 0;">Tax:</td>
                <td style="text-align: right; padding: 5px 0;">₹{{ number_format($order->tax, 2) }}</td>
            </tr>
            <tr>
                <td style="padding: 5px 0;">Shipping:</td>
                <td style="text-align: right; padding: 5px 0;">₹{{ number_format($order->shipping, 2) }}</td>
            </tr>
            @if($order->discount > 0)
            <tr>
                <td style="padding: 5px 0;">Discount:</td>
                <td style="text-align: right; padding: 5px 0;">-₹{{ number_format($order->discount, 2) }}</td>
            </tr>
            @endif
            <tr style="border-top: 2px solid #e5e7eb; font-weight: bold; font-size: 1.1em;">
                <td style="padding: 10px 0;">Total:</td>
                <td style="text-align: right; padding: 10px 0;">₹{{ number_format($order->total, 2) }}</td>
            </tr>
        </table>
    </div>

    @if($order->shipping_address)
    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Shipping Address</h2>
        <p style="margin: 5px 0;">{{ $order->shipping_address['address'] ?? '' }}</p>
        <p style="margin: 5px 0;">{{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['state'] ?? '' }} - {{ $order->shipping_address['pincode'] ?? '' }}</p>
        <p style="margin: 5px 0;">Phone: {{ $order->shipping_address['phone'] ?? '' }}</p>
    </div>
    @endif

    <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 0.9em;">
        <p>Thank you for shopping with Vinu Visthara!</p>
        <p>We'll send you another email when your order ships.</p>
    </div>
</body>
</html>
