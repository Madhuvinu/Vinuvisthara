'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getAbsoluteImageUrl } from '@/utils/imageUrl';

interface Product {
  id: string;
  name: string;
  title?: string;
  price: number;
  compare_at_price?: number;
  thumbnail?: string;
  images?: string[];
  description?: string;
  has_discount?: boolean;
  discount_percentage?: number;
  discount_amount?: number;
  discounted_price?: number;
  offer_text?: string;
  average_rating?: number;
  total_reviews?: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const rawUrl = product.images?.[0] || product.thumbnail;
  const PLACEHOLDER = '/vinlogo.png';
  const imageUrl = imageError || !rawUrl
    ? PLACEHOLDER
    : (getAbsoluteImageUrl(typeof rawUrl === 'string' ? rawUrl : (rawUrl as { image_url?: string })?.image_url) || PLACEHOLDER);
  
  // Price logic: Always show price as selling price, compare_at_price as MRP
  // Convert to numbers to ensure proper comparison
  const price = Number(product.price) || 0;
  const mrp = product.compare_at_price ? Number(product.compare_at_price) : null;
  
  // Use discounted_price if provided and active, otherwise use price
  const discountedPrice = product.discounted_price ? Number(product.discounted_price) : null;
  const displayPrice = (discountedPrice && product.has_discount && discountedPrice < price)
    ? discountedPrice
    : price;
  
  // Calculate discount percentage from MRP vs final selling price (displayPrice)
  // This ensures discount is calculated from the actual selling price (which may be discounted)
  const discountPercent = mrp && mrp > displayPrice
    ? Math.round(((mrp - displayPrice) / mrp) * 100)
    : null;
  
  // Show discount if MRP exists and is greater than final selling price
  const hasDiscount = discountPercent !== null && discountPercent > 0;
  
  const offerText = product.offer_text;
  const averageRating = product.average_rating || 0;
  const totalReviews = product.total_reviews || 0;
  const productName = product.name || product.title || 'Untitled Product';

  return (
    <Link href={`/products/${product.id}`} data-cursor="product">
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
        whileHover={{ y: -8 }}
      >
        {/* Image Container */}
        <div className="relative h-96 w-full overflow-hidden bg-gray-100">
          {/* Discount Badge - Show if MRP > price */}
          {hasDiscount && discountPercent && discountPercent > 0 && (
            <div className="absolute top-3 left-3 z-20 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {discountPercent}% OFF
            </div>
          )}
          
          {/* Offer Badge */}
          {offerText && (
            <div className="absolute top-3 right-3 z-20 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              {offerText}
            </div>
          )}

          <motion.div
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative w-full h-full"
          >
            <Image
              src={imageUrl}
              alt={productName}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImageError(true)}
              unoptimized
            />
          </motion.div>

          {/* Overlay on Hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center z-10"
          >
            <motion.span
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-white font-poppins font-semibold text-lg uppercase tracking-wider"
            >
              View Product
            </motion.span>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <h3 className="text-xl font-playfair font-semibold text-gray-900 mb-2 line-clamp-2">
            {productName}
          </h3>
          
          {/* Rating */}
          {averageRating > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < Math.round(averageRating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({averageRating.toFixed(1)})
              </span>
              {totalReviews > 0 && (
                <span className="text-xs text-gray-500">
                  ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              )}
            </div>
          )}
          
          {/* Price - Always show selling price, show MRP with strikethrough if exists */}
          <div className="mt-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Selling Price - Always shown */}
              <span className="text-2xl font-poppins font-bold text-gray-900">
                ₹{displayPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              {/* MRP with strikethrough - Show if MRP exists and is greater than selling price */}
              {mrp && mrp > displayPrice && (
                <>
                  <span className="text-lg font-poppins text-gray-500 line-through">
                    ₹{mrp.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  {discountPercent && discountPercent > 0 && (
                    <span className="text-sm text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded">
                      {discountPercent}% OFF
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
