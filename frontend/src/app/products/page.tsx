'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { api } from '@/lib/api';
import { logger } from '@/utils/logger';

// Product interface matching ProductCard's expectations
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
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        logger.info('Fetching products', { timestamp: new Date().toISOString() });
        setLoading(true);
        setError(null);

        const response = await api.getProducts({ limit: 100 });
        logger.info('Products API response received', {
          timestamp: new Date().toISOString(),
          hasResponse: !!response,
          productsCount: response?.products?.length || 0,
        });

        // API returns { products: [...] }
        const productsData = response?.products || [];
        
        logger.info('Products parsed successfully', {
          timestamp: new Date().toISOString(),
          count: productsData.length,
          productIds: productsData.slice(0, 3).map((p: Product) => p.id),
        });

        // Products are already in correct format from Laravel API
        // Note: api.getProducts() returns compareAtPrice (camelCase), but we need compare_at_price (snake_case)
        const transformedProducts = productsData.map((product: any) => ({
          id: product.id,
          name: product.name || product.title || 'Untitled Product',
          title: product.title || product.name,
          price: product.price || 0,
          compare_at_price: product.compare_at_price || product.compareAtPrice || null, // Support both formats
          thumbnail: product.thumbnail,
          images: product.images || [],
          description: product.description,
          has_discount: product.has_discount || false,
          discount_percentage: product.discount_percentage || 0,
          discount_amount: product.discount_amount || 0,
          discounted_price: product.discounted_price || product.price || 0,
          offer_text: product.offer_text,
        }));

        setProducts(transformedProducts);
        logger.info('Products set in state', {
          timestamp: new Date().toISOString(),
          count: transformedProducts.length,
        });
      } catch (err: any) {
        logger.error('Failed to fetch products', err as Error, {
          timestamp: new Date().toISOString(),
          errorMessage: err.message,
          errorResponse: err.response?.data,
        });
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 font-poppins text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <p className="font-poppins text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-900 text-white font-poppins rounded-lg hover:bg-gray-800 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 py-20 px-4 pt-32">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-4">
            All Products
          </h1>
          <p className="text-gray-600 font-poppins text-lg">
            {products.length} {products.length === 1 ? 'product' : 'products'} available
          </p>
        </motion.div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-poppins text-gray-600 text-lg">No products found.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
