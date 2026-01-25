<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice - {{ $order_number }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            margin-bottom: 30px;
        }
        .header h1 {
            color: #8B4513;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .invoice-info {
            margin-bottom: 30px;
        }
        .invoice-info h2 {
            color: #8B4513;
            font-size: 18px;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table th {
            background-color: #8B4513;
            color: white;
            padding: 10px;
            text-align: left;
        }
        table td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
        .totals {
            margin-top: 20px;
            text-align: right;
        }
        .totals table {
            width: 300px;
            margin-left: auto;
        }
        .totals td {
            padding: 5px 10px;
        }
        .total-row {
            font-weight: bold;
            font-size: 16px;
            border-top: 2px solid #8B4513;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Vinu Visthara</h1>
        <p>Traditional Indian Sarees</p>
    </div>

    <div class="invoice-info">
        <h2>Invoice</h2>
        <p><strong>Order Number:</strong> {{ $order_number }}</p>
        <p><strong>Date:</strong> {{ $created_at->format('d M Y, h:i A') }}</p>
    </div>

    <div>
        <h3>Bill To:</h3>
        @if($shipping_address)
            @php
                $addr = is_array($shipping_address) ? $shipping_address : json_decode($shipping_address, true);
            @endphp
            @if(isset($addr['email']))
                <p>{{ $addr['email'] }}</p>
            @endif
            <p>{{ $addr['address'] ?? '' }}</p>
            <p>{{ ($addr['city'] ?? '') . ', ' . ($addr['state'] ?? '') . ' - ' . ($addr['pincode'] ?? '') }}</p>
            @if(isset($addr['phone']))
                <p>Phone: {{ $addr['phone'] }}</p>
            @endif
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
                <tr>
                    <td>{{ $item->product_name ?? 'Product' }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>₹{{ number_format($item->price, 0) }}</td>
                    <td>₹{{ number_format($item->total, 0) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td>₹{{ number_format($subtotal, 0) }}</td>
            </tr>
            @if($shipping > 0)
            <tr>
                <td>Shipping:</td>
                <td>₹{{ number_format($shipping, 0) }}</td>
            </tr>
            @endif
            @if($tax > 0)
            <tr>
                <td>Tax (GST):</td>
                <td>₹{{ number_format($tax, 0) }}</td>
            </tr>
            @endif
            @if($discount > 0)
            <tr>
                <td>Discount:</td>
                <td>-₹{{ number_format($discount, 0) }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td>Total:</td>
                <td>₹{{ number_format($total, 0) }}</td>
            </tr>
        </table>
    </div>

    <div style="margin-top: 30px;">
        <p><strong>Payment Status:</strong> {{ ucfirst($payment_status) }}</p>
        <p><strong>Order Status:</strong> {{ ucfirst($status) }}</p>
    </div>

    <div style="margin-top: 50px; text-align: center; color: #666; font-size: 10px;">
        <p>Thank you for your order!</p>
    </div>
</body>
</html>
