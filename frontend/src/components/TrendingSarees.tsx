'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  discounted_price?: number;
  thumbnail?: string;
  images?: string[];
  compare_at_price?: number;
  has_discount?: boolean;
  discount_percentage?: number;
  discount_amount?: number;
  offer_text?: string;
  average_rating?: number;
  total_reviews?: number;
}

// Star Rating Component
const StarRating = ({ rating = 5, totalReviews = 0 }: { rating?: number; totalReviews?: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < fullStars
              ? 'fill-amber-400 text-amber-400'
              : i === fullStars && hasHalfStar
              ? 'fill-amber-200 text-amber-400'
              : 'fill-none text-amber-200'
          }`}
        />
      ))}
      {totalReviews > 0 && (
        <span className="ml-1 text-xs text-[#8b7355]">({totalReviews})</span>
      )}
    </div>
  );
};

export default function TrendingSarees() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.getProducts({ limit: 3 });
        const list = res?.products || [];
        setProducts(Array.isArray(list) ? list : []);
      } catch (e) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/90 rounded-2xl p-4 shadow-lg animate-pulse"
          >
            <div className="aspect-[3/4] rounded-xl bg-gray-200 mb-4" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-5 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
      {products.slice(0, 3).map((p) => {
        const img = p.images?.[0] || p.thumbnail;
        const displayPrice = p.has_discount && p.discounted_price != null && p.discounted_price < p.price
          ? p.discounted_price
          : p.price;
        const originalPrice = p.compare_at_price || p.price;
        const rating = p.average_rating || 5;
        const reviews = p.total_reviews || 0;

        return (
          <Link
            key={p.id}
            href={`/products/${p.id}`}
            className="group block"
          >
            <div className="bg-white/95 rounded-2xl p-4 md:p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#e8ddd0]">
              {/* Product Image */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-4 bg-gray-100">
                {img ? (
                  <Image
                    src={img}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-200 text-gray-400 text-sm">
                    No image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="font-serif text-base md:text-lg font-semibold text-[#3b2f2a] line-clamp-2">
                  {p.name}
                </h3>
                
                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-xl md:text-2xl font-bold text-[#8b7355]">
                    ₹{displayPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  {originalPrice > displayPrice && (
                    <span className="text-sm text-[#a08a75] line-through">
                      ₹{originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  )}
                </div>

                {/* Star Rating */}
                <StarRating rating={rating} totalReviews={reviews} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
