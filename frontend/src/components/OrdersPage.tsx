'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
// Orders are fetched from backend which queries Medusa database
import { isAuthenticated } from '@/utils/auth';

interface Order {
  id: string;
  display_id: number | string;
  status: string;
  fulfillment_status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  currency_code?: string;
  items: Array<{
    id: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
    total: number;
    subtotal?: number;
    thumbnail?: string;
    variant_id?: string;
    product_id?: string;
  }>;
  shipping_address?: {
    first_name?: string;
    last_name?: string;
    address_1: string;
    address_2?: string;
    city: string;
    province: string;
    postal_code: string;
    phone?: string;
    country_code?: string;
  };
  created_at: string;
  updated_at?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!isAuthenticated()) {
          router.push('/login');
          return;
        }

        // Fetch orders from backend
        try {
          const { api } = await import('@/lib/api');
          const response = await api.getMyOrders();
          
          // Backend returns { orders: [...] }
          const ordersData = response.orders || [];
          
          setOrders(ordersData);
        } catch (orderError: any) {
          setOrders([]);
        }
      } catch (error: any) {
        // Show error to user
        if (error.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

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

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-8"
        >
          My Orders
        </motion.h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-poppins text-lg mb-4">No orders found</p>
            <p className="text-gray-400 font-poppins text-sm mb-6">
              If you've placed orders before, try logging out and logging back in.
            </p>
            <div className="flex gap-4 justify-center">
            <Link
              href="/collections/all"
              className="inline-block px-8 py-4 bg-purple-600 text-white font-poppins font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start Shopping
            </Link>
              <button
                onClick={() => {
                  // Clear auth and redirect to login
                  localStorage.removeItem('auth');
                  localStorage.removeItem('auth');
                  router.push('/login?redirect=/orders');
                }}
                className="inline-block px-8 py-4 bg-gray-600 text-white font-poppins font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                Re-login to Sync Orders
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-playfair font-semibold text-gray-900 mb-2">
                      Order #{order.display_id || order.id}
                    </h3>
                    <p className="text-gray-600 font-poppins text-sm">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-4 py-2 rounded text-sm font-semibold ${
                      order.fulfillment_status === 'fulfilled' || order.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                      order.status === 'canceled' || order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.fulfillment_status || order.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      {item.thumbnail && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.thumbnail}
                            alt={item.title || 'Product'}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-poppins font-medium text-gray-900">{item.title || 'Product'}</p>
                        {item.description && (
                          <p className="text-gray-600 font-poppins text-sm">{item.description}</p>
                        )}
                        <p className="text-gray-600 font-poppins text-sm">
                          Quantity: {item.quantity} × ₹{((item.unit_price || 0)).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-gray-600 font-poppins text-sm">Total</p>
                    <p className="text-2xl font-poppins font-bold text-gray-900">
                      ₹{((order.total || 0)).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="px-6 py-2 bg-purple-600 text-white font-poppins font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
