import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from '../utils/logger';

// All APIs now use Laravel backend (port 8000)
const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API Client initialization - logger handles all logging

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    // All requests now go to Laravel API
    this.client = axios.create({
      baseURL: `${LARAVEL_API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: 10000, // 10 second timeout
      withCredentials: false, // Don't send cookies for API requests
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        if (typeof window !== 'undefined') {
          const authData = localStorage.getItem('auth');
          if (authData) {
            try {
              const auth = JSON.parse(authData);
              if (auth.token) {
                config.headers.Authorization = `Bearer ${auth.token}`;
              }
            } catch (error) {
              // Ignore
            }
          }
        }

        logger.debug('API request', {
          method: config.method,
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
        });

        return config;
      },
      (error) => {
        logger.error('API request error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API response', {
          method: response.config.method,
          url: response.config.url,
          status: response.status,
        });
        return response;
      },
      (error: AxiosError) => {
        const errorMessage = error.response?.data || error.message;
        
        logger.error('API response error', error, {
          method: error.config?.method,
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
        });

        // Handle network errors (connection refused, etc.)
        if (!error.response) {
          const networkError = {
            code: error.code,
            message: error.message,
            baseURL: this.client.defaults.baseURL,
            fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
            isECONNREFUSED: error.code === 'ECONNREFUSED',
            isNetworkError: error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_REFUSED'),
          };
          
          logger.error('Network error - backend server may not be running', networkError);
        }

        // Handle specific error cases
        if (error.response?.status === 401) {
          // Unauthorized - clear auth and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints - Using Laravel API
  async register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    try {
      const fullURL = `${this.client.defaults.baseURL}/auth/register`;
      const payload = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      };
      
      logger.info('API register request', {
        email: data.email,
        baseURL: this.client.defaults.baseURL,
        url: '/auth/register',
        fullURL,
      });
      
      const response = await this.client.post('/auth/register', payload);
      
      logger.info('API register response', { 
        status: response.status,
      });
      return response.data;
    } catch (error: any) {
      logger.error('API register error', error, {
        message: error.message,
        code: error.code,
        response: error.response?.status,
        baseURL: this.client.defaults.baseURL,
      });
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const fullURL = `${this.client.defaults.baseURL}/auth/login`;
      
      logger.info('API login request', { 
        email, 
        baseURL: this.client.defaults.baseURL,
        url: '/auth/login',
        fullURL,
      });
      
      const response = await this.client.post('/auth/login', { email, password });
      
      logger.info('API login response', { status: response.status });
      return response.data;
    } catch (error: any) {
      logger.error('API login error', error, {
        message: error.message,
        code: error.code,
        response: error.response?.status,
        baseURL: this.client.defaults.baseURL,
      });
      throw error;
    }
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/auth/logout');
    return response.data;
  }

  // Admin authentication endpoints
  async adminLogin(email: string, password: string) {
    try {
      const fullURL = `${this.client.defaults.baseURL}/admin/auth/login`;
      
      logger.info('API admin login request', { 
        email, 
        baseURL: this.client.defaults.baseURL,
        url: '/admin/auth/login',
        fullURL,
      });
      
      const response = await this.client.post('/admin/auth/login', { email, password });
      
      logger.info('API admin login response', { status: response.status });
      return response.data;
    } catch (error: any) {
      logger.error('API admin login error', error, {
        message: error.message,
        code: error.code,
        response: error.response?.status,
        baseURL: this.client.defaults.baseURL,
      });
      throw error;
    }
  }

  async adminLogout() {
    const response = await this.client.post('/admin/auth/logout');
    return response.data;
  }

  async getCurrentAdmin() {
    const response = await this.client.get('/admin/auth/me');
    return response.data;
  }

  async requestPasswordReset(email: string) {
    // Note: Password reset endpoint needs to be implemented in Laravel
    const response = await this.client.post('/auth/password/reset-request', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    // Note: Password reset endpoint needs to be implemented in Laravel
    const response = await this.client.post('/auth/password/reset', { token, newPassword });
    return response.data;
  }

  // Product endpoints - Using Laravel API
  async getProducts(params?: {
    category?: string;
    occasion?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    fabric?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    collection_id?: string;
  }) {
    try {
      const queryParams: any = {
        limit: params?.limit || 20,
      };

      if (params?.search) queryParams.search = params.search;
      if (params?.category) queryParams.category = params.category;
      if (params?.color) queryParams.color = params.color;
      if (params?.fabric) queryParams.fabric = params.fabric;
      if (params?.occasion) queryParams.occasion = params.occasion;
      if (params?.minPrice) queryParams.minPrice = params.minPrice;
      if (params?.maxPrice) queryParams.maxPrice = params.maxPrice;
      if (params?.collection_id) queryParams.collection_id = params.collection_id;

      const response = await this.client.get('/products', { params: queryParams });
      
      // Transform Laravel products to frontend format
      const products = (response.data.products || []).map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        title: p.name,
        description: p.description,
        price: parseFloat(p.price) || 0,
        compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : null, // Keep snake_case for consistency
        compareAtPrice: p.compare_at_price ? parseFloat(p.compare_at_price) : null, // Also include camelCase for compatibility
        images: p.images?.map((img: any) => 
          typeof img === 'string' ? img : img.image_url || img.url
        ) || [p.thumbnail].filter(Boolean),
        thumbnail: p.thumbnail || p.images?.[0]?.image_url || null,
        category: p.category?.name || null,
        collection: p.collection?.name || null,
        status: p.status,
        availability: p.status === 'published' && (p.stock || 0) > 0 ? 'in_stock' : 'out_of_stock',
        inventory: p.stock || 0,
        tags: p.tags?.map((t: any) => t.name) || [],
        // Discount fields
        has_discount: p.has_discount || false,
        discount_percentage: p.discount_percentage ? parseFloat(p.discount_percentage) : 0,
        discount_amount: p.discount_amount ? parseFloat(p.discount_amount) : 0,
        discounted_price: p.discounted_price ? parseFloat(p.discounted_price) : (parseFloat(p.price) || 0),
        offer_text: p.offer_text || null,
        average_rating: p.average_rating || 0,
        total_reviews: p.total_reviews || 0,
      }));

      return {
        products,
        pagination: response.data.pagination || {
          total: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / (params?.limit || 20)),
          page: params?.page || 1,
          limit: params?.limit || 20,
        },
      };
    } catch (error) {
      logger.error('Failed to fetch products', error as Error);
      throw error;
    }
  }

  async getProduct(id: string) {
    try {
      const response = await this.client.get(`/products/${id}`);
      const p = response.data.product || response.data;
      
      return {
        id: p.id.toString(),
        name: p.name,
        title: p.name,
        description: p.description,
        price: parseFloat(p.price) || 0,
        compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : null, // Keep snake_case for consistency
        compareAtPrice: p.compare_at_price ? parseFloat(p.compare_at_price) : null, // Also include camelCase for compatibility
        images: p.images?.map((img: any) => 
          typeof img === 'string' ? img : img.image_url || img.url
        ) || [p.thumbnail].filter(Boolean),
        thumbnail: p.thumbnail || p.images?.[0]?.image_url || null,
        category: p.category?.name || null,
        collection: p.collection?.name || null,
        status: p.status,
        availability: p.status === 'published' && (p.stock || 0) > 0 ? 'in_stock' : 'out_of_stock',
        inventory: p.stock || 0,
        tags: p.tags?.map((t: any) => t.name) || [],
        // Discount fields
        has_discount: p.has_discount || false,
        discount_percentage: p.discount_percentage ? parseFloat(p.discount_percentage) : 0,
        discount_amount: p.discount_amount ? parseFloat(p.discount_amount) : 0,
        discounted_price: p.discounted_price ? parseFloat(p.discounted_price) : (parseFloat(p.price) || 0),
        offer_text: p.offer_text || null,
        average_rating: p.average_rating || 0,
        total_reviews: p.total_reviews || 0,
      };
    } catch (error) {
      logger.error('Failed to fetch product', error as Error);
      throw error;
    }
  }

  async getCollections() {
    try {
      const response = await this.client.get('/collections');
      return response.data || [];
    } catch (error) {
      logger.error('Failed to fetch collections', error as Error);
      return [];
    }
  }

  async getCategories() {
    try {
      const response = await this.client.get('/categories');
      return response.data || [];
    } catch (error) {
      logger.error('Failed to fetch categories', error as Error);
      return [];
    }
  }

  // Cart endpoints - Using Laravel API
  async getCart() {
    try {
      const response = await this.client.get('/cart');
      return response.data;
    } catch (error) {
      logger.error('Failed to get cart', error as Error);
      throw error;
    }
  }

  async addToCart(productId: string, quantity: number = 1) {
    const response = await this.client.post('/cart/add', {
      product_id: productId,
      quantity,
    });
    return response.data;
  }

  async updateCartItem(itemId: string, quantity: number) {
    const response = await this.client.post('/cart/update', {
      item_id: itemId,
      quantity,
    });
    return response.data;
  }

  async removeFromCart(itemId: string) {
    const response = await this.client.delete('/cart/remove', {
      data: { item_id: itemId },
    });
    return response.data;
  }

  async clearCart() {
    // Get cart and remove all items
    const cart = await this.getCart();
    if (cart.items && cart.items.length > 0) {
      for (const item of cart.items) {
        await this.removeFromCart(item.id);
      }
    }
    return { message: 'Cart cleared' };
  }

  // Discount and Coupon endpoints
  async applyCoupon(code: string, cartId?: string) {
    try {
      const response = await this.client.post('/coupons/apply', {
        code,
        cart_id: cartId,
      });
      return response.data;
    } catch (error: any) {
      logger.error('Failed to apply coupon', error);
      throw error;
    }
  }

  async calculateDiscount(cartId: string, couponCode?: string) {
    try {
      const response = await this.client.post('/discounts/calculate', {
        cart_id: cartId,
        coupon_code: couponCode,
      });
      return response.data;
    } catch (error: any) {
      logger.error('Failed to calculate discount', error);
      throw error;
    }
  }

  // Order endpoints - Using Laravel API
  async createOrder(data: {
    shippingAddress: {
      address: string;
      city: string;
      state: string;
      pincode: string;
      phone: string;
      email?: string;
    };
    paymentMethod?: string;
    notes?: string;
  }) {
    const response = await this.client.post('/orders/create', data);
    return response.data;
  }

  // Payment endpoints
  async createPaymentOrder(orderId: string) {
    const response = await this.client.post('/payments/create-order', {
      order_id: orderId,
    });
    return response.data;
  }

  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order_id: string;
  }) {
    const response = await this.client.post('/payments/verify', data);
    return response.data;
  }

  async getMyOrders() {
    try {
      logger.debug('Fetching orders');
      const response = await this.client.get('/orders');
      
      // Backend returns array directly, wrap it
      const orders = Array.isArray(response.data) ? response.data : (response.data.orders || []);
      logger.debug('Orders fetched', { count: orders.length });
      return { orders };
    } catch (error: any) {
      logger.error('Failed to fetch orders', error);
      throw error;
    }
  }

  async getOrder(id: string) {
    const response = await this.client.get(`/orders/${id}`);
    return response.data;
  }

  // Slider endpoints - Using Laravel API
  async getSliders(includeInactive = false) {
    const response = await this.client.get('/slider-images');
    const sliders = response.data.sliders || [];
    if (!includeInactive) {
      return sliders.filter((s: any) => s.is_active !== false);
    }
    return sliders;
  }

  async getSlider(id: string) {
    const response = await this.client.get(`/slider-images/${id}`);
    return response.data;
  }

  // File upload endpoint
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Use a separate client instance for file uploads (multipart/form-data)
    const uploadClient = axios.create({
      baseURL: `${LARAVEL_API_URL}/api`,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('auth');
      if (authData) {
        try {
          const auth = JSON.parse(authData);
          if (auth.token) {
            uploadClient.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
          }
        } catch (error) {
          // Ignore
        }
      }
    }

    const response = await uploadClient.post('/upload', formData);
    return response.data;
  }

  // Admin slider methods (stubs - use Filament admin instead)
  async createSlider(data: any) {
    // Note: Use Filament admin at /admin/slider-images instead
    throw new Error('Please use the admin panel at /admin/slider-images to create sliders');
  }

  async updateSlider(id: string, data: any) {
    // Note: Use Filament admin at /admin/slider-images instead
    throw new Error('Please use the admin panel at /admin/slider-images to update sliders');
  }

  async deleteSlider(id: string) {
    // Note: Use Filament admin at /admin/slider-images instead
    throw new Error('Please use the admin panel at /admin/slider-images to delete sliders');
  }

  async reorderSliders(ids: string[]) {
    // Note: Use Filament admin at /admin/slider-images instead
    throw new Error('Please use the admin panel at /admin/slider-images to reorder sliders');
  }

  // Product Reviews
  async getProductReviews(productId: string) {
    try {
      const response = await this.client.get(`/products/${productId}/reviews`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch product reviews', error as Error);
      throw error;
    }
  }

  async submitProductReview(productId: string, data: {
    rating: number;
    comment?: string;
    customer_name?: string;
  }) {
    try {
      const response = await this.client.post(`/products/${productId}/reviews`, data);
      return response.data;
    } catch (error) {
      logger.error('Failed to submit product review', error as Error);
      throw error;
    }
  }
}

export const api = new ApiClient();
