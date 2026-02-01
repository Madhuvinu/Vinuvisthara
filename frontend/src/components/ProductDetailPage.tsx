'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Star, Send } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { logger } from '@/utils/logger';
import { getAbsoluteImageUrl } from '@/utils/imageUrl';
import { isAuthenticated, refreshAuth } from '@/utils/auth';

interface Product {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  images?: Array<{ url: string } | string>;
  thumbnail?: string;
  price?: number;
  compare_at_price?: number | null;
  has_discount?: boolean;
  discount_percentage?: number;
  discount_amount?: number;
  discounted_price?: number;
  offer_text?: string;
  average_rating?: number;
  total_reviews?: number;
}

interface ProductDetailPageProps {
  productId: string;
}

export default function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Check auth on mount and when storage changes (after login)
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = isAuthenticated();
      logger.info('Auth status check', {
        authenticated: authStatus,
        hasAuth: !!localStorage.getItem('auth')
      });
      setUserAuthenticated(authStatus);
      
      // Refresh auth expiration on activity (extend session)
      if (authStatus) {
        refreshAuth();
      }
    };
    
    // Check immediately
    checkAuthStatus();
    
    // Also check after a short delay (handles login redirect where localStorage might not be immediately available)
    const delayedCheck = setTimeout(() => {
      checkAuthStatus();
    }, 300);
    
    // Re-check when component gains focus (handles login redirect back to page)
    const handleFocus = () => {
      checkAuthStatus();
    };
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth') {
        logger.info('Storage changed, re-checking auth', { key: e.key });
        checkAuthStatus();
      }
    };
    
    // Also listen to custom storage events (same window)
    const handleCustomStorage = () => {
      logger.info('Custom auth-changed event received');
      checkAuthStatus();
    };
    
    // Re-check when page becomes visible (handles login redirect)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        logger.info('Page became visible, re-checking auth');
        checkAuthStatus();
      }
    };
    
    // Listen for URL changes (handles navigation back after login)
    const handlePopState = () => {
      logger.info('PopState event, re-checking auth');
      setTimeout(checkAuthStatus, 100);
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-changed', handleCustomStorage);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check periodically to catch session expiration
    const interval = setInterval(checkAuthStatus, 5000); // Check every 5 seconds
    
    return () => {
      clearTimeout(delayedCheck);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-changed', handleCustomStorage);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        logger.info('Fetching product from Laravel', { productId });
        
        // Fetch from Laravel API
        const response = await api.getProduct(productId);
        
        if (response) {
          setProduct(response);
          setAverageRating(response.average_rating || 0);
          setTotalReviews(response.total_reviews || 0);
          logger.info('Product fetched successfully', { productId: response.id });
        } else {
          logger.error('Product not found', { productId });
          toast.error('Product not found');
        }
      } catch (error: any) {
        logger.error('Failed to fetch product', error);
        toast.error(error.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const reviewData = await api.getProductReviews(productId);
        setReviews(reviewData.reviews || []);
        setAverageRating(reviewData.average_rating || 0);
        setTotalReviews(reviewData.total_reviews || 0);
      } catch (error) {
        logger.error('Failed to fetch reviews', error);
        // Don't show error toast for reviews, just log it
      }
    };

    if (productId) {
      fetchProduct();
      fetchReviews();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    // Re-check auth status immediately before adding to cart
    // This ensures we have the latest auth state after login redirect
    let authStatus = isAuthenticated();
    
    // Log current auth state for debugging
    const authRaw = localStorage.getItem('auth');
    
    logger.info('Add to Cart - Auth Check', {
      authenticated: authStatus,
      hasAuth: !!authRaw,
      userAuthenticatedState: userAuthenticated,
    });
    
    // If not authenticated, wait a bit and check again (handles async localStorage after login redirect)
    if (!authStatus) {
      await new Promise(resolve => setTimeout(resolve, 200));
      authStatus = isAuthenticated();
      
      logger.info('Add to Cart - Auth Check Retry', {
        authenticated: authStatus,
        hasAuth: !!localStorage.getItem('auth')
      });
    }
    
    // Final check with detailed logging
    if (!authStatus) {
      // Try to parse and show what's in localStorage for debugging
      let authDetails = null;
      
      try {
        const auth = localStorage.getItem('auth');
        if (auth) {
          authDetails = JSON.parse(auth);
        }
      } catch (e) {
        // Ignore
      }
      
      logger.warn('User not authenticated when trying to add to cart', {
        hasAuth: !!authRaw,
        userAuthenticatedState: userAuthenticated,
        authDetails: authDetails ? {
          hasToken: !!authDetails.token,
          hasCustomer: !!authDetails.customer,
          hasUser: !!authDetails.user,
          hasExpiresAt: !!authDetails.expiresAt
        } : null
      });
      
      toast.error('Please login to add items to cart');
      router.push('/login?redirect=' + encodeURIComponent(`/products/${productId}`));
      return;
    }
    
    // Update state to reflect authenticated status
    setUserAuthenticated(true);
    logger.info('User authenticated, proceeding with add to cart', {
      hasAuth: true
    });
    
    // Refresh session on activity (extend by 30 minutes)
    refreshAuth();
    
    if (!product) {
      toast.error('Product not available');
      return;
    }
    
    setIsAdding(true);
    try {
      logger.info('Adding product to cart', { productId: product.id, quantity });
      
      // For logged-in customers, use /carts/me to get or create customer's cart
      // This ensures cart is properly associated with the customer
      let cart = null;
      let cartId = null;
      
      // Get or create cart (Laravel auto-creates if doesn't exist)
      const cartResponse = await api.getCart();
      logger.info('Cart retrieved', { cartId: cartResponse.id });
      
      // Add product to cart (Laravel uses product_id directly, no variants)
      const addResponse = await api.addToCart(productId, quantity);
      logger.info('Product added to cart successfully', { 
        productId, 
        quantity,
      });
      
      // Store cart ID in localStorage for cart page access
      if (addResponse.id) {
        localStorage.setItem('cart_id', addResponse.id);
        logger.info('Cart ID stored in localStorage', { cartId: addResponse.id });
      }
      
      toast.success('Product added to cart!', {
        duration: 2000
      });
      
      // Auto-redirect to cart page after adding
      setTimeout(() => {
        router.push('/cart');
      }, 1500);
    } catch (error: any) {
      logger.error('Failed to add to cart', error);
      
      // Handle 401 Unauthorized - customer might have been logged out
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.');
        // Clear auth and redirect to login
        const { clearAuth } = await import('@/utils/auth');
        clearAuth();
        router.push('/login?redirect=' + encodeURIComponent(`/products/${productId}`));
        return;
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add to cart';
      toast.error(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!userAuthenticated) {
      toast.error('Please login to submit a review');
      router.push('/login?redirect=' + encodeURIComponent(`/products/${productId}`));
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const auth = localStorage.getItem('auth');
      const authData = auth ? JSON.parse(auth) : null;
      
      await api.submitProductReview(productId, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
        customer_name: reviewName.trim() || authData?.customer?.email || undefined,
      });

      toast.success('Review submitted successfully! It will be visible after approval.');
      setReviewRating(5);
      setReviewComment('');
      setReviewName('');
      setShowReviewForm(false);

      // Refresh reviews
      const reviewData = await api.getProductReviews(productId);
      setReviews(reviewData.reviews || []);
      setAverageRating(reviewData.average_rating || 0);
      setTotalReviews(reviewData.total_reviews || 0);
    } catch (error: any) {
      logger.error('Failed to submit review', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to submit review';
      toast.error(errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-gray-500 font-poppins text-lg">Product not found</p>
        </div>
      </div>
    );
  }

  // Transform images array: normalize to string URLs and make absolute (API domain) so next/image can load them
  const rawImages = product.images?.map((img: any) =>
    typeof img === 'string' ? img : (img?.image_url || img?.url || img)
  ).filter(Boolean) || (product.thumbnail ? [product.thumbnail] : []);
  const images = rawImages
    .map((url: string) => getAbsoluteImageUrl(url))
    .filter((url): url is string => url != null);
  
  // Price logic: Always show price as selling price, compare_at_price as MRP
  const price = product.price || 0;
  const mrp = product.compare_at_price || null;
  
  // Use discounted_price if provided and active, otherwise use price
  const displayPrice = product.discounted_price && product.has_discount
    ? product.discounted_price
    : price;
  
  // Calculate discount percentage from MRP vs final selling price (displayPrice)
  // This ensures discount is calculated from the actual selling price (which may be discounted)
  const calculatedDiscountPercent = mrp && mrp > displayPrice
    ? Math.round(((mrp - displayPrice) / mrp) * 100)
    : null;
  
  // Use admin discount percentage if available, otherwise use calculated discount
  const discountPercentage = product.discount_percentage || calculatedDiscountPercent || 0;
  const hasDiscount = (mrp && mrp > displayPrice) || (product.has_discount && product.discounted_price && product.discounted_price < price);
  
  const offerText = product.offer_text;
  
  const productName = product.title || product.name || 'Untitled Product';

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Main Image with Zoom */}
            <div className="relative h-96 lg:h-[600px] w-full rounded-xl overflow-hidden bg-gray-100 mb-4 group cursor-zoom-in">
              {/* Discount Badge - Show if MRP > price */}
              {hasDiscount && calculatedDiscountPercent && calculatedDiscountPercent > 0 && (
                <div className="absolute top-4 left-4 z-20 bg-green-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                  {calculatedDiscountPercent}% OFF
                </div>
              )}
              
              {/* Offer Badge */}
              {offerText && (
                <div className="absolute top-4 right-4 z-20 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {offerText}
                </div>
              )}
              
              {/* Zoom Hint */}
              <div className="absolute bottom-4 right-4 z-20 bg-black/50 text-white px-3 py-1.5 rounded-lg text-xs font-poppins opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Hover to zoom
              </div>
              
              {images[selectedImage] ? (
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={images[selectedImage]}
                    alt={productName}
                    fill
                    className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-[2.5]"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Image Gallery - Thumbnails */}
            {images.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-poppins font-semibold text-gray-700 mb-2">
                  {images.length} {images.length === 1 ? 'Image' : 'Images'} Available
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-purple-600 ring-2 ring-purple-300'
                          : 'border-gray-200 hover:border-purple-400'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${productName} - View ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized
                      />
                      {selectedImage === index && (
                        <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                          <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-4">
              {productName}
            </h1>

            {/* Price with Discount */}
            <div className="mb-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-3xl font-poppins font-bold text-gray-900">
                  ₹{displayPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                {mrp && mrp > displayPrice && (
                  <>
                    <span className="text-2xl font-poppins text-gray-500 line-through">
                      ₹{mrp.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                    {calculatedDiscountPercent && calculatedDiscountPercent > 0 && (
                      <span className="text-lg text-green-600 font-semibold bg-green-50 px-3 py-1 rounded">
                        {calculatedDiscountPercent}% OFF
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Offer Text */}
            {offerText && (
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-semibold">
                  {offerText}
                </span>
              </div>
            )}

            {product.description && (
              <div className="mb-8">
                <h3 className="font-poppins font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 font-poppins leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block font-poppins font-semibold text-gray-900 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-poppins font-semibold text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full px-8 py-4 bg-purple-600 text-white font-poppins font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 col-span-1 lg:col-span-2"
        >
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-2">
                  Customer Reviews
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-poppins font-semibold text-gray-700">
                    {averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
              {userAuthenticated && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-6 py-3 bg-purple-600 text-white font-poppins font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {showReviewForm ? 'Cancel' : 'Write a Review'}
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && userAuthenticated && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xl font-playfair font-bold mb-4">Write Your Review</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-poppins font-semibold text-gray-900 mb-2">
                      Rating *
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              star <= reviewRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-poppins font-semibold text-gray-900 mb-2">
                      Your Name (optional)
                    </label>
                    <input
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-poppins"
                    />
                  </div>
                  <div>
                    <label className="block font-poppins font-semibold text-gray-900 mb-2">
                      Your Review (optional)
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-poppins resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview}
                    className="px-6 py-3 bg-purple-600 text-white font-poppins font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-poppins text-lg">
                    No reviews yet. Be the first to review this product!
                  </p>
                  {!userAuthenticated && (
                    <button
                      onClick={() => router.push('/login?redirect=' + encodeURIComponent(`/products/${productId}`))}
                      className="mt-4 px-6 py-2 bg-purple-600 text-white font-poppins font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Login to Write a Review
                    </button>
                  )}
                </div>
              ) : (
                reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-poppins font-semibold text-gray-900 mb-1">
                          {review.customer_name || 'Anonymous'}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          {review.is_featured && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 font-poppins">
                        {new Date(review.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 font-poppins leading-relaxed mt-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
