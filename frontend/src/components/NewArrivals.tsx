'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  discounted_price?: number;
  thumbnail?: string;
  primary_image?: string;
}

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await fetch('/api/products?limit=8&sort=newest');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || data || []);
        }
      } catch (error) {
        // Silently fail - component will show empty state
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-center mb-12">
            New Arrivals
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-center mb-12">
          New Arrivals
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                {/* Product Image */}
                <div className="relative w-full h-full">
                  <Image
                    src={product.primary_image || product.thumbnail || '/placeholder-product.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>

                {/* Product Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white font-poppins font-medium text-sm mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {product.discounted_price ? (
                      <>
                        <span className="text-white font-poppins font-semibold">
                          ${product.discounted_price}
                        </span>
                        <span className="text-white/70 line-through text-sm">
                          ${product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-white font-poppins font-semibold">
                        ${product.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
