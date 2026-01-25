# Razorpay Payment Gateway Integration - Setup Guide

## Overview
This guide will help you set up Razorpay payment gateway integration for your e-commerce application.

## Prerequisites
- Razorpay account (Sign up at https://razorpay.com)
- Laravel backend with Razorpay PHP SDK installed
- Next.js frontend

## Step 1: Install Razorpay PHP SDK

Navigate to your Laravel backend directory and install the Razorpay SDK:

```bash
cd backend-laravel
composer require razorpay/razorpay
```

## Step 2: Get Razorpay API Keys

1. Log in to your Razorpay Dashboard: https://dashboard.razorpay.com
2. Go to **Settings** → **API Keys**
3. Generate **Test Keys** for development (or **Live Keys** for production)
4. Copy your **Key ID** and **Key Secret**

## Step 3: Configure Environment Variables

Add the following to your `backend-laravel/.env` file:

```env
RAZORPAY_KEY=your_razorpay_key_id_here
RAZORPAY_SECRET=your_razorpay_secret_key_here
```

**Important:** 
- For development, use **Test Keys**
- For production, use **Live Keys** and ensure your `.env` file is secure
- Never commit your `.env` file to version control

## Step 4: Files Created/Updated

The following files have been created or updated:

### Backend Files:
1. ✅ `backend-laravel/config/services.php` - Added Razorpay configuration
2. ✅ `backend-laravel/app/Services/RazorpayService.php` - Razorpay service class
3. ✅ `backend-laravel/app/Http/Controllers/Api/PaymentController.php` - Payment controller
4. ✅ `backend-laravel/app/Http/Controllers/Api/OrderController.php` - Updated to handle payment methods
5. ✅ `backend-laravel/routes/api.php` - Added payment routes

### Frontend Files:
1. ✅ `frontend/src/lib/api.ts` - Added payment API methods
2. ✅ `frontend/src/app/checkout/page.tsx` - Updated with Razorpay integration

## Step 5: Test the Integration

### Test Mode:
1. Use Razorpay test credentials from your dashboard
2. Use test card numbers:
   - **Card Number:** 4111 1111 1111 1111
   - **CVV:** Any 3 digits
   - **Expiry:** Any future date
   - **Name:** Any name

### Testing Flow:
1. Add items to cart
2. Go to checkout page
3. Fill in shipping address
4. Select "Online Payment (Razorpay)"
5. Click "Pay Now"
6. Complete payment using test credentials
7. Verify order is created and payment is recorded

## Step 6: Production Setup

### Before Going Live:
1. **Switch to Live Keys:**
   - Generate Live API keys from Razorpay dashboard
   - Update `.env` file with live credentials

2. **Complete KYC:**
   - Complete Razorpay KYC verification
   - Submit required business documents

3. **Webhook Setup (Optional but Recommended):**
   - Configure webhooks in Razorpay dashboard
   - Add webhook endpoint: `https://yourdomain.com/api/webhooks/razorpay`
   - Handle payment status updates via webhooks

4. **Security:**
   - Ensure HTTPS is enabled
   - Keep API keys secure
   - Use environment variables (never hardcode)
   - Enable Razorpay's fraud detection features

## Step 7: Payment Flow

### Cash on Delivery (COD):
1. User selects COD
2. Order is created with `payment_status: pending`
3. Order is confirmed immediately
4. Cart is cleared
5. Email confirmation sent

### Online Payment (Razorpay):
1. User selects Razorpay
2. Order is created with `payment_status: pending`
3. Razorpay payment window opens
4. User completes payment
5. Payment is verified on backend
6. Order status updated to `payment_status: paid`
7. Cart is cleared
8. Email confirmation sent

## API Endpoints

### Create Payment Order
```
POST /api/payments/create-order
Headers: Authorization: Bearer {token}
Body: { "order_id": 123 }
Response: { "order_id": "order_xxx", "amount": 10000, "currency": "INR", "key": "rzp_test_xxx" }
```

### Verify Payment
```
POST /api/payments/verify
Headers: Authorization: Bearer {token}
Body: {
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "order_id": 123
}
Response: { "success": true, "message": "Payment verified successfully", "order": {...} }
```

## Troubleshooting

### Common Issues:

1. **"Razorpay credentials not configured"**
   - Check `.env` file has `RAZORPAY_KEY` and `RAZORPAY_SECRET`
   - Run `php artisan config:clear` to refresh config cache

2. **Payment verification fails**
   - Ensure you're using correct order_id and payment_id
   - Check signature is valid
   - Verify API keys match (test/test or live/live)

3. **Razorpay popup doesn't open**
   - Check Razorpay script is loaded: `https://checkout.razorpay.com/v1/checkout.js`
   - Check browser console for errors
   - Verify API key is correct

4. **Order not updating after payment**
   - Check payment verification endpoint logs
   - Verify database transaction is completing
   - Check order belongs to authenticated user

## Support

- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com
- Razorpay Dashboard: https://dashboard.razorpay.com

## Security Notes

1. **Never expose your Secret Key** in frontend code
2. Always verify payment signatures on backend
3. Use HTTPS in production
4. Implement proper error handling
5. Log payment transactions for audit
6. Monitor failed payments and handle appropriately

## Next Steps

1. ✅ Install Razorpay SDK
2. ✅ Add API keys to `.env`
3. ✅ Test payment flow
4. ⬜ Complete KYC for production
5. ⬜ Set up webhooks (optional)
6. ⬜ Switch to live keys when ready
7. ⬜ Monitor payment transactions

---

**Status:** Integration complete! Follow the steps above to configure and test.
