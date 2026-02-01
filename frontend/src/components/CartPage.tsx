'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { api } from '@/lib/api';
import { logger } from '@/utils/logger';
import toast from 'react-hot-toast';
import { getAbsoluteImageUrl } from '@/utils/imageUrl';
import { isAuthenticated as checkAuth, refreshAuth } from '@/utils/auth';

interface CartItem {
  id: string;
  variant?: {
    product?: {
      title?: string;
      thumbnail?: string;
      images?: Array<{ url: string }>;
    };
  };
  unit_price?: number;
  quantity: number;
  title?: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);

  useEffect(() => {
    // Refresh session on activity
    const isAuth = checkAuth();
    if (isAuth) {
      refreshAuth();
    }
    
    // Fetch cart - don't require auth (allow anonymous carts too)
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Re-fetch cart when window gains focus (handles returning from login)
  useEffect(() => {
    const handleFocus = () => {
      const isAuth = checkAuth();
      if (isAuth) {
        // Refresh cart when returning from login
        fetchCart();
      }
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const isAuth = checkAuth();
        if (isAuth) {
          fetchCart();
        }
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const isAuth = checkAuth();
      
      logger.info('Fetching cart', { isAuthenticated: isAuth });
      
      if (isAuth) {
        // Logged-in user - get their cart
        try {
          const cartData = await api.getCart();
          logger.info('Cart fetched', { 
            cartId: cartData.id,
            itemsCount: cartData.items?.length || 0
          });
          setCart(cartData);
          
          // Load applied discount from cart
          if (cartData.discount && parseFloat(cartData.discount) > 0) {
            if (cartData.coupon_code) {
              // Manual coupon/discount code applied
              setAppliedDiscount({
                code: cartData.coupon_code,
                type: 'coupon',
                amount: parseFloat(cartData.discount) || 0,
              });
              setDiscountCode(cartData.coupon_code);
            } else {
              // Auto-applied discount (no code)
              setAppliedDiscount({
                code: 'AUTO',
                type: 'discount',
                amount: parseFloat(cartData.discount) || 0,
              });
            }
          }
        } catch (error: any) {
          if (error.response?.status === 401) {
            toast.error('Your session has expired. Please login again.');
            router.push('/login?redirect=' + encodeURIComponent('/cart'));
            return;
          }
          logger.error('Failed to fetch cart', error);
          toast.error('Failed to load cart. Please try again.');
        }
      } else {
        // Guest user - use session-based cart
        const sessionId = localStorage.getItem('cart_session_id') || 
          (() => {
            const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('cart_session_id', newSessionId);
            return newSessionId;
          })();
        
        try {
          // For guest carts, we need to create/get via session
          // Laravel guest cart endpoint: /api/cart/guest/{sessionId}
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/cart/guest/${sessionId}`);
          if (response.ok) {
            const cartData = await response.json();
            setCart(cartData);
          } else {
            // Create new guest cart
            const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/cart/guest/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session_id: sessionId }),
            });
            if (createResponse.ok) {
              const cartData = await createResponse.json();
              setCart(cartData.cart || cartData);
            }
          }
        } catch (error) {
          logger.error('Failed to fetch guest cart', error);
        }
      }
    } catch (error: any) {
      logger.error('Failed to fetch cart - unexpected error', error);
      toast.error('Failed to load cart. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!cart?.id) {
      toast.error('Cart not initialized');
      return;
    }
    
    try {
      await api.updateCartItem(itemId, quantity);
      toast.success('Cart updated');
      fetchCart();
    } catch (error: any) {
      logger.error('Failed to update cart', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update cart';
      toast.error(errorMessage);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!cart?.id) {
      toast.error('Cart not initialized');
      return;
    }
    
    try {
      await api.removeFromCart(itemId);
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error: any) {
      logger.error('Failed to remove item', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove item';
      toast.error(errorMessage);
    }
  };

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
          fetchCart();
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
        fetchCart();
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
      toast.success('Discount code removed');
      fetchCart();
    } catch (error: any) {
      logger.error('Failed to remove discount', error);
      toast.error('Failed to remove discount code');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart message if cart doesn't exist or has no items
  const cartItems = cart?.items || [];
  const hasItems = cartItems.length > 0;
  
  if (!loading && (!cart || !hasItems)) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 font-poppins mb-8">
              Start shopping to add items to your cart
            </p>
            <Link
              href="/collections/all"
              className="inline-block px-8 py-4 bg-purple-600 text-white font-poppins font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-8"
        >
          Shopping Cart
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item: any, index: number) => {
                  // Laravel cart item structure
                  const productTitle = item.product?.name || item.product_name || 'Product';
                  // Try multiple image sources; make absolute so image loads from API domain
                  const rawThumb = item.product?.thumbnail ||
                    item.product?.formatted_images?.[0]?.image_url ||
                    item.product?.images?.[0]?.image_url ||
                    (Array.isArray(item.product?.images) && item.product.images[0]
                      ? (typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0].image_url)
                      : null) ||
                    item.product?.primary_image || '';
                  const productThumbnail = rawThumb ? getAbsoluteImageUrl(rawThumb) : '';
                  const unitPrice = parseFloat(item.price) || 0;
                  const itemTotal = parseFloat(item.total) || (unitPrice * item.quantity);
                  
                  return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-md flex gap-6"
                  >
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {productThumbnail ? (
                        <Image
                          src={productThumbnail}
                          alt={productTitle}
                          fill
                          className="object-cover"
                          sizes="96px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-playfair font-semibold text-gray-900 mb-2">
                        {productTitle}
                      </h3>
                      <p className="text-2xl font-poppins font-bold text-gray-900 mb-4">
                        ₹{itemTotal.toLocaleString()}
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border border-gray-300 rounded">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-poppins">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-md sticky top-24"
            >
              <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Discount/Coupon Code Section */}
              <div className="mb-6 pb-6 border-b border-gray-200">
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
                    <label className="block text-sm font-poppins font-semibold text-gray-700 mb-2">
                      Discount Code / Coupon
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            applyDiscountCode();
                          }
                        }}
                      />
                      <button
                        onClick={applyDiscountCode}
                        disabled={applyingDiscount || !discountCode.trim()}
                        className="px-4 py-2 bg-purple-600 text-white font-poppins font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {applyingDiscount ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 font-poppins mt-2">
                      Enter your discount code or coupon code
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 font-poppins">
                  <span>Subtotal</span>
                  <span>₹{cart.subtotal ? parseFloat(cart.subtotal).toLocaleString() : '0'}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-600 font-poppins">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>-₹{appliedDiscount.amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 font-poppins">
                  <span>Shipping</span>
                  <span>{cart.shipping && parseFloat(cart.shipping) > 0 ? `₹${parseFloat(cart.shipping).toLocaleString()}` : 'Free'}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-poppins">
                  <span>Tax (GST)</span>
                  <span>₹{cart.tax ? parseFloat(cart.tax).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between text-xl font-poppins font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{cart.total ? parseFloat(cart.total).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full px-8 py-4 bg-purple-600 text-white font-poppins font-semibold rounded-lg hover:bg-purple-700 transition-colors text-center"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/collections/all"
                className="block w-full mt-4 text-center text-gray-600 font-poppins hover:text-gray-900 transition-colors"
              >
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
