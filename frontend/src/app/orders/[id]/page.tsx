'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { logger } from '@/utils/logger';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { CheckCircle2, Package, Truck, Home, Clock } from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      loadOrder(params.id as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  const loadOrder = async (id: string) => {
    try {
      logger.debug('Loading order', { orderId: id });
      const response = await api.getOrder(id);
      
      // Laravel returns order directly
      const orderData = response;
      
      if (!orderData || !orderData.id) {
        throw new Error('Order not found or invalid response');
      }
      
      setOrder(orderData);
      logger.info('Order loaded from Medusa', { orderId: id, orderNumber: orderData.display_id });
    } catch (error: any) {
      logger.error('Failed to load order', error as Error, { orderId: id, errorDetails: error.response?.data });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load order';
      toast.error(errorMessage);
      
      // If 401, redirect to login
      if (error.response?.status === 401) {
        router.push('/login?redirect=' + encodeURIComponent(`/orders/${id}`));
      } else {
      router.push('/orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      logger.info('Downloading invoice', { orderId: order.id });
      
      // Get auth token
      const auth = localStorage.getItem('auth');
      const authToken = auth ? JSON.parse(auth).token : null;
      
      // Use Laravel backend API to generate invoice
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/orders/${order.id}/invoice`, {
        method: 'GET',
        headers: {
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('Invoice download failed', { status: response.status, error: errorData });
        throw new Error(errorData.error || `Failed to download invoice: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Check if blob is actually a PDF (not an error JSON)
      if (blob.type !== 'application/pdf') {
        const text = await blob.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || 'Failed to generate invoice');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.order_number || order.display_id || order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Invoice downloaded');
      logger.info('Invoice downloaded successfully');
    } catch (error: any) {
      logger.error('Failed to download invoice', error as Error);
      toast.error(error.message || 'Failed to download invoice');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
        <Link href="/orders" className="text-saree-maroon hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/orders" className="text-saree-maroon hover:underline">
          ← Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order #{order.order_number || order.display_id || order.id}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.created_at || order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-2 rounded text-sm font-semibold ${
                order.status === 'completed' || order.fulfillment_status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'canceled' || order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                order.status === 'shipped' || order.fulfillment_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                order.fulfillment_status === 'packed' ? 'bg-purple-100 text-purple-800' :
                order.fulfillment_status === 'picked' ? 'bg-orange-100 text-orange-800' :
                order.fulfillment_status === 'processing' ? 'bg-cyan-100 text-cyan-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.fulfillment_status ? 
                  order.fulfillment_status.charAt(0).toUpperCase() + order.fulfillment_status.slice(1) : 
                  (order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending')
                }
              </span>
              {order.tracking_number && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Tracking:</span> {order.tracking_number}
                  {order.carrier && <span className="ml-2">({order.carrier})</span>}
                </div>
              )}
              <p className="text-sm text-gray-600">
                Payment: {order.payment_status || order.paymentStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Beautiful Order Tracking Timeline */}
        {(order.fulfillment_status || order.status) && (
          <div className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
            <h2 className="text-2xl font-playfair font-bold mb-6 text-saree-maroon">Order Tracking</h2>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              
              {/* Timeline Steps */}
              <div className="space-y-6">
                {/* Order Confirmed */}
                <div className="relative flex items-start gap-4">
                  <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full ${
                    order.fulfillment_status && ['processing', 'picked', 'packed', 'shipped', 'delivered'].includes(order.fulfillment_status)
                      ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <CheckCircle2 className={`w-8 h-8 ${order.fulfillment_status && ['processing', 'picked', 'packed', 'shipped', 'delivered'].includes(order.fulfillment_status) ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">Order Confirmed</h3>
                      {order.fulfillment_status && ['processing', 'picked', 'packed', 'shipped', 'delivered'].includes(order.fulfillment_status) && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {order.created_at || order.createdAt ? new Date(order.created_at || order.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">Your order has been confirmed and is being prepared</p>
                  </div>
                </div>

                {/* Processing */}
                {order.fulfillment_status && ['processing', 'picked', 'packed', 'shipped', 'delivered'].includes(order.fulfillment_status) && (
                  <div className="relative flex items-start gap-4">
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-blue-500">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">Processing</h3>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <p className="text-gray-600 text-sm">Your order is being processed</p>
                    </div>
                  </div>
                )}

                {/* Shipped */}
                {order.fulfillment_status && ['shipped', 'delivered'].includes(order.fulfillment_status) && (
                  <div className="relative flex items-start gap-4">
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-purple-500">
                      <Truck className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">Shipped</h3>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <p className="text-gray-600 text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {order.shipped_at ? new Date(order.shipped_at).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </p>
                      {order.tracking_number && (
                        <div className="mt-2 p-3 bg-white rounded-lg border border-purple-200">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Tracking Information</p>
                          <p className="text-xs text-gray-600">
                            <span className="font-semibold">Carrier:</span> {order.carrier || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-600">
                            <span className="font-semibold">Tracking #:</span> 
                            <a 
                              href={`https://www.google.com/search?q=${order.carrier || 'track'}+${order.tracking_number}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:underline ml-1"
                            >
                              {order.tracking_number}
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivered */}
                {order.fulfillment_status === 'delivered' && (
                  <div className="relative flex items-start gap-4">
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-green-500">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">Delivered</h3>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <p className="text-gray-600 text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {order.delivered_at ? new Date(order.delivered_at).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">Your order has been successfully delivered</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex gap-4 border-b pb-4">
                {item.thumbnail && (
                  <div className="relative w-24 h-24 bg-gray-200 rounded">
                    <Image
                      src={item.thumbnail}
                      alt={item.title || 'Product'}
                      fill
                      className="object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-saree.jpg';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title || item.productName || 'Product'}</h3>
                  <p className="text-gray-600">{item.description || item.variant?.title || ''}</p>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-saree-maroon font-bold">
                    ₹{(parseFloat(item.unit_price || item.price || 0)).toLocaleString()} × {item.quantity} = ₹{(parseFloat(item.total || (item.unit_price || item.price || 0) * item.quantity)).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="text-gray-600">
              {order.shipping_address ? (
                <>
                  <p>{order.shipping_address.address_1}</p>
                  {order.shipping_address.address_2 && <p>{order.shipping_address.address_2}</p>}
                  <p>{order.shipping_address.city}, {order.shipping_address.province} - {order.shipping_address.postal_code}</p>
                  <p>Phone: {order.shipping_address.phone}</p>
                </>
              ) : order.shippingAddress && typeof order.shippingAddress === 'object' ? (
                <>
                  <p>{order.shippingAddress.address || ''}</p>
                  <p>{order.shippingAddress.city || ''}, {order.shippingAddress.state || ''} - {order.shippingAddress.pincode || ''}</p>
                  <p>Phone: {order.shippingAddress.phone || ''}</p>
                  {order.shippingAddress.email && <p>Email: {order.shippingAddress.email}</p>}
                </>
              ) : (
                <>
                  <p>{order.shippingAddress || 'No address provided'}</p>
                  {order.shippingCity && <p>{order.shippingCity}, {order.shippingState} - {order.shippingPincode}</p>}
                  {order.shippingPhone && <p>Phone: {order.shippingPhone}</p>}
                </>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{(parseFloat(order.subtotal || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{(parseFloat(order.shipping_total || order.shipping || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{(parseFloat(order.tax_total || order.tax || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-xl border-t pt-2">
                <span>Total</span>
                <span>₹{(parseFloat(order.total || 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {order.metadata?.notes && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Notes</h2>
            <p className="text-gray-600">{order.metadata.notes}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleDownloadInvoice}
            className="bg-saree-maroon text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
          >
            Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
