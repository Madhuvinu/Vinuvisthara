'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { api } from '@/lib/api';
import { logger } from '@/utils/logger';

// Product interface matching ProductCard expectations
interface Product {
  id: string;
  name: string; // Required - always set in transformation
  title?: string; // Optional - for compatibility
  price: number; // Required - always set in transformation
  compare_at_price?: number; // MRP/Compare at price
  thumbnail?: string;
  images?: string[]; // Array of image URLs (not objects)
  description?: string;
  has_discount?: boolean;
  discount_percentage?: number;
  discount_amount?: number;
  discounted_price?: number;
  offer_text?: string;
  average_rating?: number;
  total_reviews?: number;
}

interface CollectionPageProps {
  slug: string;
}

export default function CollectionPage({ slug }: CollectionPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectionName, setCollectionName] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        logger.info('Fetching products from Laravel', { slug });
        
        // Fetch products from Laravel API
        const response = await api.getProducts({
          limit: 100, // Fetch all products
        });
        
        // Laravel products are already in correct format
        const transformedProducts: Product[] = (response.products || []).map((product: any) => ({
          id: product.id.toString(),
          name: product.name || product.title || 'Untitled Product',
          title: product.title || product.name,
          description: product.description || '',
          price: product.price || 0,
          compare_at_price: product.compare_at_price, // MRP/Compare at price
          thumbnail: product.thumbnail,
          images: product.images || [],
          has_discount: product.has_discount || false,
          discount_percentage: product.discount_percentage || 0,
          discount_amount: product.discount_amount || 0,
          discounted_price: product.discounted_price || product.price || 0,
          offer_text: product.offer_text,
          average_rating: product.average_rating || 0,
          total_reviews: product.total_reviews || 0,
        }));
        
        // Filter by collection if needed (for future collection filtering)
        let filteredProducts = transformedProducts;
        if (slug !== 'all') {
          // For now, show all products. In future, filter by collection_id
          // filteredProducts = transformedProducts.filter(p => p.collection_id === slug);
        }
        
        setProducts(filteredProducts);
        logger.info('Products fetched successfully', { count: filteredProducts.length });
      } catch (error) {
        logger.error('Failed to fetch products from Laravel', error as Error);
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    
    // Set collection name
    const names: Record<string, string> = {
      all: 'All Products',
      skincare: 'Skincare',
      haircare: 'Haircare',
      wellness: 'Wellness',
    };
    setCollectionName(names[slug] || slug.charAt(0).toUpperCase() + slug.slice(1));
  }, [slug]);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-playfair font-bold text-gray-900 mb-4">
            {collectionName}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-poppins max-w-2xl mx-auto">
            Discover our curated selection of premium products, carefully crafted with traditional wisdom and modern science.
          </p>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-96 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 font-poppins text-lg">No products found in this collection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
