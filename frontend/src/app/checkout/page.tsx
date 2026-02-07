'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { logger } from '@/utils/logger';
import toast from 'react-hot-toast';
import { isAuthenticated, refreshAuth } from '@/utils/auth';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);
  const [cart, setCart] = useState<any>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    // Check authentication before allowing checkout
    if (!isAuthenticated()) {
      toast.error('Please login to checkout');
      router.push('/login?redirect=' + encodeURIComponent('/checkout'));
      return;
    }
    
    // Refresh session on activity
    refreshAuth();
    
    // Load cart from localStorage or create new one
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadCart = async () => {
      try {
        // Get cart from Laravel API
        const cartData = await api.getCart();
        if (cartData) {
          setCart(cartData);
          setCartId(cartData.id);
        }
      } catch (error) {
        logger.error('Failed to load cart', error as Error);
        toast.error('Failed to load cart. Please try again.');
      }
    };

    loadCart();
  }, [router]);

  // Load applied discount from cart
  useEffect(() => {
    if (cart?.discount && parseFloat(cart.discount) > 0) {
      if (cart.coupon_code) {
        // Manual coupon/discount code applied
        setAppliedDiscount({
          code: cart.coupon_code,
          type: 'coupon',
          amount: parseFloat(cart.discount) || 0,
        });
        setDiscountCode(cart.coupon_code);
      } else {
        // Auto-applied discount (no code)
        setAppliedDiscount({
          code: 'AUTO',
          type: 'discount',
          amount: parseFloat(cart.discount) || 0,
        });
      }
    }
  }, [cart]);

  // Auto-fill email from auth
  useEffect(() => {
    if (typeof window !== 'undefined' && !shippingAddress.email) {
      const authData = localStorage.getItem('auth');
      if (authData) {
        try {
          const auth = JSON.parse(authData);
          const userEmail = auth.user?.email || auth.email;
          if (userEmail) {
            setShippingAddress(prev => ({ ...prev, email: userEmail }));
          }
        } catch (error) {
          // Ignore parse errors
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount - userEmail is from localStorage, doesn't need to be in deps

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code');
      return;
    }

    if (!cart?.id) {
      toast.error('Cart not initialized');
      return;
    }

    setApplyingDiscount(true);
    try {
      // First try to apply as coupon
      try {
        const couponResponse = await api.applyCoupon(discountCode.trim().toUpperCase(), cart.id);
        if (couponResponse.coupon) {
          // Coupon applied successfully, recalculate cart
          const discountResponse = await api.calculateDiscount(cart.id, discountCode.trim().toUpperCase());
          setAppliedDiscount({
            code: discountCode.trim().toUpperCase(),
            type: 'coupon',
            amount: discountResponse.discount,
          });
          toast.success(`Coupon "${discountCode.trim().toUpperCase()}" applied successfully!`);
          setDiscountCode('');
          // Reload cart
          const cartData = await api.getCart();
          setCart(cartData);
          return;
        }
      } catch (couponError: any) {
        // If coupon fails, try as discount code
        logger.info('Coupon not found, trying as discount code');
      }

      // Try as discount code
      const discountResponse = await api.calculateDiscount(cart.id, discountCode.trim().toUpperCase());
      if (discountResponse.discount > 0) {
        setAppliedDiscount({
          code: discountCode.trim().toUpperCase(),
          type: 'discount',
          amount: discountResponse.discount,
        });
        toast.success(`Discount code "${discountCode.trim().toUpperCase()}" applied successfully!`);
        setDiscountCode('');
        // Reload cart
        const cartData = await api.getCart();
        setCart(cartData);
      } else {
        toast.error('Invalid or expired discount code');
      }
    } catch (error: any) {
      logger.error('Failed to apply discount code', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Invalid or expired discount code';
      toast.error(errorMessage);
    } finally {
      setApplyingDiscount(false);
    }
  };

  const removeDiscount = async () => {
    if (!cart?.id) {
      return;
    }

    try {
      // Recalculate cart without discount code
      await api.calculateDiscount(cart.id, '');
      setAppliedDiscount(null);
      setDiscountCode('');
      toast.success('Discount code removed');
      // Reload cart
      const cartData = await api.getCart();
      setCart(cartData);
    } catch (error: any) {
      logger.error('Failed to remove discount', error);
      toast.error('Failed to remove discount code');
    }
  };

  const handleRazorpayPayment = async (orderData: any) => {
    try {
      if (!(window as any).Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please refresh and try again.');
      }

      // Create Razorpay order
      const paymentOrder = await api.createPaymentOrder(orderData.id);

      const options = {
        key: paymentOrder.key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Vinu Visthara',
        description: `Order ${orderData.orderNumber}`,
        order_id: paymentOrder.order_id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verification = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderData.id.toString(),
            });

            if (verification.success) {
              toast.success(`Payment successful! Order #${orderData.orderNumber}`);
              router.push(`/orders/${orderData.id}`);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error: any) {
            logger.error('Payment verification error', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: 'Customer',
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#8B1538',
        },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled');
            setLoading(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      logger.error('Razorpay payment error', error);
      toast.error('Failed to initialize payment');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error('Cart is empty. Please add items to cart.');
      return;
    }

    setLoading(true);

    try {
      logger.info('Starting checkout process', { shippingAddress, paymentMethod });

      // Create order using Laravel API
      const orderData = await api.createOrder({
        shippingAddress: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
        },
        paymentMethod: paymentMethod,
        notes: '',
      });

      logger.info('Order created successfully', { 
        orderId: orderData.id,
        orderNumber: orderData.orderNumber,
        paymentMethod: orderData.paymentMethod,
      });

      if (paymentMethod === 'razorpay') {
        // Handle Razorpay payment
        await handleRazorpayPayment(orderData);
      } else {
        // COD - order already confirmed
        // Clear cart
        await api.clearCart();

        // Show success message
        toast.success(`Order placed successfully! Order #${orderData.orderNumber}`);

        // Redirect to order confirmation page
        router.push(`/orders/${orderData.id}`);
        setLoading(false);
      }
    } catch (error: any) {
      logger.error('Checkout error', error as Error);
      const errorMessage = error.response?.data?.error || error.message || 'Checkout failed';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  // Load Razorpay script (for future payment integration)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  if (!cart) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-8 text-center">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">
            Shipping Address
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                required
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-saree-maroon focus:ring-2 focus:ring-rose-200 focus:outline-none transition"
                rows={3}
                placeholder="Street address, apartment, suite, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-saree-maroon focus:ring-2 focus:ring-rose-200 focus:outline-none transition"
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-saree-maroon focus:ring-2 focus:ring-rose-200 focus:outline-none transition"
                  placeholder="Maharashtra"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={shippingAddress.pincode}
                  onChange={(e) => {
                    // Only allow numbers and limit to 6 digits for Indian pincodes
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setShippingAddress({ ...shippingAddress, pincode: value });
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-saree-maroon focus:ring-2 focus:ring-rose-200 focus:outline-none transition"
                  placeholder="110001 (6 digits)"
                />
                <p className="text-xs text-gray-500 mt-1">Enter 6-digit Indian pincode</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-saree-maroon focus:ring-2 focus:ring-rose-200 focus:outline-none transition"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={shippingAddress.email}
                onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-saree-maroon focus:ring-2 focus:ring-rose-200 focus:outline-none transition"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            {/* Discount/Coupon Code Section */}
            <div className="mb-6">
              <h3 className="text-xl font-playfair font-bold text-gray-900 mb-4">
                Discount Code / Coupon
              </h3>
              {appliedDiscount ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-poppins font-semibold text-green-800">
                        {appliedDiscount.type === 'coupon' ? 'Coupon Applied' : appliedDiscount.code === 'AUTO' ? 'Discount Applied Automatically' : 'Discount Applied'}
                      </p>
                      {appliedDiscount.code !== 'AUTO' && (
                        <p className="text-xs font-poppins text-green-600 mt-1">
                          Code: {appliedDiscount.code}
                        </p>
                      )}
                      {appliedDiscount.code === 'AUTO' && (
                        <p className="text-xs font-poppins text-green-600 mt-1">
                          Automatically applied based on cart value
                        </p>
                      )}
                    </div>
                    {appliedDiscount.code !== 'AUTO' && (
                      <button
                        type="button"
                        onClick={removeDiscount}
                        className="text-green-600 hover:text-green-800 text-sm font-poppins underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-lg font-poppins font-bold text-green-800">
                    -₹{appliedDiscount.amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      placeholder="Enter discount or coupon code"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition font-poppins"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          applyDiscountCode();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={applyDiscountCode}
                      disabled={applyingDiscount || !discountCode.trim()}
                      className="px-6 py-3 bg-purple-600 text-white font-poppins font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {applyingDiscount ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 font-poppins mt-2">
                    Enter your discount code or coupon code to save on your order
                  </p>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="text-xl font-playfair font-bold text-gray-900 mb-4">
                Payment Method
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4 border-2 border-purple-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="cod"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-5 h-5 text-purple-600"
                    />
                    <label htmlFor="cod" className="flex-1 cursor-pointer">
                      <span className="font-poppins font-semibold text-gray-900 block">Cash on Delivery (COD)</span>
                      <span className="font-poppins text-sm text-gray-600">Pay when you receive your order</span>
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border-2 border-purple-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="razorpay"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="w-5 h-5 text-purple-600"
                    />
                    <label htmlFor="razorpay" className="flex-1 cursor-pointer">
                      <span className="font-poppins font-semibold text-gray-900 block">Online Payment</span>
                      <span className="font-poppins text-sm text-gray-600">UPI / Cards / Netbanking</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-playfair font-bold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 font-poppins">
                  <span>Subtotal</span>
                  <span>₹{cart.subtotal ? parseFloat(cart.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-600 font-poppins">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>-₹{appliedDiscount.amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                )}
                {cart.discount && !appliedDiscount && (
                  <div className="flex justify-between text-green-600 font-poppins">
                    <span>Discount</span>
                    <span>-₹{parseFloat(cart.discount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 font-poppins">
                  <span>Shipping</span>
                  <span>{cart.shipping && parseFloat(cart.shipping) > 0 ? `₹${parseFloat(cart.shipping).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'Free'}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-poppins">
                  <span>Tax (GST)</span>
                  <span>₹{cart.tax ? parseFloat(cart.tax).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}</span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between text-xl font-poppins font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{cart.total ? parseFloat(cart.total).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !cartId}
              className="w-full bg-gradient-to-r from-saree-maroon to-red-700 text-white py-4 rounded-lg font-poppins font-semibold text-lg hover:from-red-700 hover:to-saree-maroon transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order (Cash on Delivery)'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
