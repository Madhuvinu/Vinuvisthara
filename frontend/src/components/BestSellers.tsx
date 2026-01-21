'use client';

import Link from 'next/link';
import Image from 'next/image';
import ScrollReveal from '@/components/ScrollReveal';

interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  thumbnail?: string;
  images?: string[];
  collection?: string;
}

interface BestSellersProps {
  products: Product[];
}

export default function BestSellers({ products }: BestSellersProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="mb-16 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500 font-poppins font-semibold mb-4">
              Customer Favorites
            </p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-playfair font-bold text-gray-900 leading-[0.9]">
              Best
              <br />
              <span className="text-gray-400">Sellers</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => {
            const imageUrl = product.thumbnail || product.images?.[0] || '/placeholder-saree.jpg';
            
            return (
              <ScrollReveal key={product.id} direction="up" delay={index * 100}>
                <Link
                  href={`/products/${product.id}`}
                  data-cursor="product"
                  className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <div className="relative h-96 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <div className="absolute top-4 right-4 bg-luxury-gold text-luxury-charcoal px-4 py-2 rounded-full text-xs font-poppins font-bold uppercase tracking-wider">
                        Sale
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    {product.collection && (
                      <p className="text-xs text-luxury-gold uppercase tracking-wider font-poppins font-semibold mb-2">
                        {product.collection}
                      </p>
                    )}
                    <h3 className="text-xl font-playfair font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-luxury-gold transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-poppins font-bold text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-lg text-gray-400 line-through font-poppins">
                          ₹{product.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
