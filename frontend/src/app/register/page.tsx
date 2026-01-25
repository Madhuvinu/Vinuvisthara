'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { saveAuth } from '@/utils/auth';
import { logger } from '@/utils/logger';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      logger.info('Registration attempt', { email: formData.email });
      
      // Register user in custom backend
      const registerData = await api.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });
      
      logger.info('User registered successfully', { userId: registerData.user?.id });
      
      // Automatically login after registration
      try {
        const loginData = await api.login(formData.email, formData.password);
        
        if (loginData.user && loginData.token) {
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
          
          logger.info('Auto-login successful', { userId: loginData.user.id });
          
          // Dispatch auth-changed event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth-changed'));
          }
          
          toast.success('Registration successful! Logging you in...');
          
          // Wait for localStorage to be set
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Redirect to home page
          router.push('/');
        } else {
          throw new Error('Auto-login failed: Invalid response');
        }
      } catch (loginError: any) {
        // Login failed, but registration succeeded - user can login manually
        logger.warn('Auto-login failed after registration', loginError as Error);
        toast.success('Registration successful! Please login with your credentials.');
        router.push('/login');
      }
    } catch (error: any) {
      logger.error('Registration failed', error as Error);
      
      // Check if it's a network/connection error
      if (!error.response) {
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
          toast.error('Cannot connect to server. Please make sure the backend server is running.');
        } else {
          toast.error(`Network error: ${error.message || 'Please check your connection and try again.'}`);
        }
      } else {
        // Server responded but with an error - show the actual error message
        const errorMessage = error.response?.data?.error 
          || error.response?.data?.message 
          || `Registration failed (${error.response?.status || 'unknown error'})`;
        
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50">
      <div className="max-w-md w-full">
        {/* Card with beautiful shadow and gradient border */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-rose-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-saree-maroon mb-2">Create Account</h1>
            <p className="text-gray-600">Join Vinuvisthara and explore beautiful sarees</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-saree-maroon focus:ring-2 focus:ring-rose-200 focus:outline-none transition"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-saree-maroon focus:ring-2 focus:ring-rose-200 focus:outline-none transition"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
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
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-saree-maroon focus:ring-2 focus:ring-rose-200 focus:outline-none transition"
                placeholder="+91 1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
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
                  Creating Account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-saree-maroon font-semibold hover:text-red-700 hover:underline transition">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
