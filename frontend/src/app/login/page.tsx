'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { saveAuth } from '@/utils/auth';
import { logger } from '@/utils/logger';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      logger.info('Login attempt', { email: formData.email });
      
      // Use custom backend API: POST /api/auth/login
      const loginData = await api.login(formData.email, formData.password);
      
      if (!loginData.user || !loginData.token) {
        throw new Error('Login failed: Invalid response from server');
      }
      
      // Transform user data to customer format for consistency
      const customer = {
        id: loginData.user.id,
        email: loginData.user.email,
        first_name: loginData.user.firstName || '',
        last_name: loginData.user.lastName || '',
        phone: loginData.user.phone || '',
      };
      
      // Save auth token and customer data
      saveAuth(loginData.token, customer);
      
      logger.info('Login successful', { 
        userId: loginData.user.id,
        email: loginData.user.email 
      });
      
      toast.success('Login successful!');
      
      // Wait for localStorage to be set and auth state to persist
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Dispatch auth-changed event to notify all components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'));
      }
      
      // Wait a bit more to ensure event is processed
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Redirect to redirect URL if provided, otherwise home page
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect') || '/';
      
      logger.info('Redirecting after login', { redirectUrl, hasAuth: !!loginData.user });
      
      // For product pages, use window.location to fully reload and refresh auth state
      if (redirectUrl.includes('/products/')) {
        // Use window.location for full page reload to ensure auth state is checked
        window.location.href = redirectUrl;
      } else {
        router.push(redirectUrl);
      }
    } catch (error: any) {
      logger.error('Login failed', error as Error, { email: formData.email });
      
      // Check if it's a network/connection error (no response from server)
      if (!error.response) {
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
          toast.error('Cannot connect to server. Please make sure the backend server is running.');
        } else {
          toast.error('Network error. Please check your connection and try again.');
        }
      } else {
        // Server responded but with an error - show the actual error message
        const errorMessage = error.response?.data?.error 
          || error.response?.data?.message 
          || `Login failed (${error.response?.status || 'unknown error'})`;
      
      toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-rose-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-saree-maroon mb-2">Welcome Back</h1>
            <p className="text-gray-600">Login to your Vinuvisthara account</p>
          </div>
        
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-saree-maroon focus:ring-2 focus:ring-rose-200 focus:outline-none transition"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-saree-maroon focus:ring-2 focus:ring-rose-200 focus:outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-saree-maroon to-red-700 text-white py-3.5 rounded-lg font-semibold text-lg hover:from-red-700 hover:to-saree-maroon transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-saree-maroon font-semibold hover:text-red-700 hover:underline transition">
                Sign up here
              </Link>
            </p>
            <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-saree-maroon hover:underline transition block">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
