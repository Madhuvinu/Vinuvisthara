import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from '../utils/logger';

// All APIs now use Laravel backend (port 8000)
const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Slider caching configuration to avoid hammering the backend
const SLIDER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let sliderCache: { data: any[]; timestamp: number } | null = null;
let sliderFetchPromise: Promise<any[]> | null = null;

// Products caching to dedupe repeated requests (home, collections, etc.)
const PRODUCT_CACHE_TTL = 60 * 1000; // 1 minute
const productCache = new Map<string, { data: any; timestamp: number }>();
const productFetchPromises = new Map<string, Promise<any>>();

// Categories + collections cache (used across multiple home sections)
const CATEGORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let categoryCache: { data: any[]; timestamp: number } | null = null;
let categoryFetchPromise: Promise<any[]> | null = null;

const COLLECTION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let collectionCache: { data: any[]; timestamp: number } | null = null;
let collectionFetchPromise: Promise<any[]> | null = null;

const buildCacheKey = (params: Record<string, any>) => {
  const normalized: Record<string, any> = {};
  Object.keys(params)
    .sort()
    .forEach((key) => {
      normalized[key] = params[key];
    });
  return JSON.stringify(normalized);
};

// Helper function to exponential backoff
const getRetryDelay = (attempt: number) => {
  return RETRY_DELAY * Math.pow(2, attempt - 1); // 1s, 2s, 4s...
};

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

    // Response interceptor with retry logic for 429 errors
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API response', {
          method: response.config.method,
          url: response.config.url,
          status: response.status,
        });
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as any;
        
        // Initialize retry count if not present
        if (!config.retryCount) {
          config.retryCount = 0;
        }

        // Retry logic for 429 (Too Many Requests) errors
        if (error.response?.status === 429 && config.retryCount < MAX_RETRIES) {
          config.retryCount++;
          const delay = getRetryDelay(config.retryCount);
          
          logger.warn(`Rate limited (429). Retrying in ${delay}ms (attempt ${config.retryCount}/${MAX_RETRIES})`, {
            url: config.url,
            method: config.method,
          });

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Retry the request
          return this.client(config);
        }

        const errorMessage = error.response?.data || error.message;
        
        logger.error('API response error', error, {
          method: error.config?.method,
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
          retryCount: config.retryCount,
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
    forceRefresh?: boolean;
  }) {
    const { forceRefresh, ...productParams } = params || {};

    const queryParams: Record<string, any> = {
      limit: productParams.limit || 20,
    };

    if (productParams.search) queryParams.search = productParams.search;
    if (productParams.category) queryParams.category = productParams.category;
    if (productParams.color) queryParams.color = productParams.color;
    if (productParams.fabric) queryParams.fabric = productParams.fabric;
    if (productParams.occasion) queryParams.occasion = productParams.occasion;
    if (productParams.minPrice) queryParams.minPrice = productParams.minPrice;
    if (productParams.maxPrice) queryParams.maxPrice = productParams.maxPrice;
    if (productParams.collection_id) queryParams.collection_id = productParams.collection_id;

    const cacheKey = buildCacheKey(queryParams);
    const now = Date.now();
    const cached = productCache.get(cacheKey);

    if (!forceRefresh && cached && now - cached.timestamp < PRODUCT_CACHE_TTL) {
      logger.debug('Serving products from cache', { cacheKey, count: cached.data?.products?.length });
      return cached.data;
    }

    if (!forceRefresh && productFetchPromises.has(cacheKey)) {
      logger.debug('Awaiting in-flight products request', { cacheKey });
      return productFetchPromises.get(cacheKey)!;
    }

    const fetchPromise = (async () => {
      try {
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

        const payload = {
          products,
          pagination: response.data.pagination || {
            total: response.data.count || 0,
            totalPages: Math.ceil((response.data.count || 0) / (productParams.limit || 20)),
            page: productParams.page || 1,
            limit: productParams.limit || 20,
          },
        };

        productCache.set(cacheKey, { data: payload, timestamp: Date.now() });
        return payload;
      } catch (error) {
        logger.error('Failed to fetch products', error as Error, { cacheKey });
        throw error;
      }
    })();

    productFetchPromises.set(cacheKey, fetchPromise);

    try {
      return await fetchPromise;
    } finally {
      productFetchPromises.delete(cacheKey);
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

  async getCollections(forceRefresh = false) {
    const now = Date.now();
    const cacheIsFresh = collectionCache && now - collectionCache.timestamp < COLLECTION_CACHE_TTL;

    if (!forceRefresh && cacheIsFresh && collectionCache) {
      logger.debug('Serving collections from cache', { count: collectionCache.data.length });
      return collectionCache.data;
    }

    if (!forceRefresh && collectionFetchPromise) {
      logger.debug('Awaiting in-flight collections request');
      return collectionFetchPromise;
    }

    collectionFetchPromise = (async () => {
      try {
        const response = await this.client.get('/collections');
        const payload = response.data || [];
        collectionCache = { data: payload, timestamp: Date.now() };
        return payload;
      } catch (error) {
        logger.error('Failed to fetch collections', error as Error);
        collectionCache = null;
        throw error;
      }
    })();

    try {
      return await collectionFetchPromise;
    } catch {
      return [];
    } finally {
      collectionFetchPromise = null;
    }
  }

  async getCategories(forceRefresh = false) {
    const now = Date.now();
    const cacheIsFresh = categoryCache && now - categoryCache.timestamp < CATEGORY_CACHE_TTL;

    if (!forceRefresh && cacheIsFresh && categoryCache) {
      logger.debug('Serving categories from cache', { count: categoryCache.data.length });
      return categoryCache.data;
    }

    if (!forceRefresh && categoryFetchPromise) {
      logger.debug('Awaiting in-flight categories request');
      return categoryFetchPromise;
    }

    categoryFetchPromise = (async () => {
      try {
        const response = await this.client.get('/categories');
        const payload = response.data || [];
        categoryCache = { data: payload, timestamp: Date.now() };
        return payload;
      } catch (error) {
        logger.error('Failed to fetch categories', error as Error);
        categoryCache = null;
        throw error;
      }
    })();

    try {
      return await categoryFetchPromise;
    } catch {
      return [];
    } finally {
      categoryFetchPromise = null;
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
  async getSliders(includeInactive = false, forceRefresh = false) {
    const filterSliders = (sliders: any[]) =>
      includeInactive ? sliders : sliders.filter((s: any) => s.is_active !== false);

    const now = Date.now();
    const cacheIsFresh = sliderCache && now - sliderCache.timestamp < SLIDER_CACHE_TTL;

    if (!forceRefresh && cacheIsFresh && sliderCache) {
      logger.debug('Serving sliders from cache', { count: sliderCache.data.length });
      return filterSliders(sliderCache.data);
    }

    if (!forceRefresh && sliderFetchPromise) {
      logger.debug('Awaiting in-flight slider request');
      const sliders = await sliderFetchPromise;
      return filterSliders(sliders);
    }

    try {
      sliderFetchPromise = this.client.get('/slider-images').then((response) => {
        const sliders = response.data.sliders || [];
        sliderCache = { data: sliders, timestamp: Date.now() };
        return sliders;
      });

      const sliders = await sliderFetchPromise;
      return filterSliders(sliders);
    } catch (error) {
      sliderCache = null;
      logger.error('Failed to fetch sliders', error as Error);
      throw error;
    } finally {
      sliderFetchPromise = null;
    }
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
