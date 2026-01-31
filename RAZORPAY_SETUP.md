# Razorpay Payments Setup (Local + Production)

Razorpay is **free to start in Test Mode** (no real money). In production, **Razorpay charges per successful transaction** (standard for all payment gateways).

This project already includes the full Razorpay flow:
- Frontend checkout opens Razorpay Checkout.
- Backend creates a Razorpay order and verifies the payment signature.

## 1) Create a Razorpay account
- Sign up at `https://razorpay.com/`
- In the Razorpay Dashboard, switch between:
  - **Test Mode** (for local/dev testing)
  - **Live Mode** (for production)

## 2) Get API keys
In Razorpay Dashboard:
- **Settings → API Keys**
- Generate keys for:
  - **Test**: `RAZORPAY_KEY` + `RAZORPAY_SECRET`
  - **Live**: `RAZORPAY_KEY` + `RAZORPAY_SECRET`

## 3) Configure backend env vars (Laravel)
Edit `backend-laravel/.env`:

```env
RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_SECRET=xxxxxxxxxxxxxxxxxxxx
```

Production: set the **Live** keys in your server env (`backend-laravel/.env` on the droplet, or your secrets manager).

## 4) Frontend configuration
No frontend keys are stored. The backend returns the public Razorpay `key` in the API response from:
- `POST /api/payments/create-order`

The checkout page loads Razorpay Checkout script:
- `https://checkout.razorpay.com/v1/checkout.js`

## 5) Payment flow (how it works)
1. Frontend creates an Order via:
   - `POST /api/orders/create`
2. Frontend requests a Razorpay order from backend:
   - `POST /api/payments/create-order` with `order_id`
3. Frontend opens Razorpay Checkout.
4. Razorpay returns `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`.
5. Frontend verifies with backend:
   - `POST /api/payments/verify`
6. Backend marks order as paid and clears cart.

## 6) Local testing checklist
- Run backend + frontend
- Ensure `RAZORPAY_KEY/SECRET` are set (Test keys)
- In checkout, choose **Online Payment (Razorpay)**
- Complete a test payment in the Razorpay Checkout popup

## 7) Production checklist
- Switch to **Live Mode** in Razorpay dashboard
- Use **Live keys** in production `.env`
- Ensure your domain is HTTPS (already required for modern payment flows)
- Verify payments are being marked as `paid` in your Orders table

