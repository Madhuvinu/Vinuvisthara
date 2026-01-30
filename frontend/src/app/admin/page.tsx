'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Image, Package, ShoppingCart, Users, FileText, Tags, Gift } from 'lucide-react';
import { isAuthenticated, isAdmin, saveAdminAuth } from '@/utils/auth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const ADMIN_SECTIONS = [
  { name: 'Dashboard', url: '/admin', icon: Settings },
  { name: 'Products', url: '/admin/products', icon: Package },
  { name: 'Categories', url: '/admin/categories', icon: Tags },
  { name: 'Orders', url: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', url: '/admin/users', icon: Users },
  { name: 'Slider Images', url: '/admin/slider-images', icon: Image },
  { name: 'Blog', url: '/admin/blogs', icon: FileText },
  { name: 'Discounts & Coupons', url: '/admin/discounts', icon: Gift },
];

export default function AdminPanel() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const admin = isAdmin();
      setIsAuth(authenticated);
      setIsAdminUser(admin);
      if (!authenticated || !admin) {
        setShowLogin(true);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.adminLogin(loginData.email, loginData.password);
      
      if (response.user && response.token) {
        saveAdminAuth(response.token, response.user);
        toast.success('Admin login successful!');
        
        // Wait for localStorage to be set
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Dispatch auth-changed event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-changed'));
        }
        
        setIsAuth(true);
        setIsAdminUser(true);
        setShowLogin(false);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth || !isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2 text-center">
              Admin Login
            </h1>
            <p className="text-gray-600 font-poppins mb-6 text-center">
              Please login with admin credentials
            </p>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-poppins font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-poppins"
                  placeholder="admin@vinuvisthara.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-poppins font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-poppins"
                  placeholder="Enter password"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-purple-600 text-white font-poppins font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login as Admin'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-purple-600 hover:text-purple-700 font-poppins"
              >
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-4">
            Admin Panel
          </h1>
          <p className="text-gray-600 font-poppins">
            Laravel Filament Admin Panel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {ADMIN_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <a
                key={section.name}
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${section.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <Icon className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-playfair font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {section.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-poppins">
                      Manage {section.name.toLowerCase()}
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-playfair font-bold text-gray-900 mb-4">
            Quick Access
          </h2>
          <div className="flex flex-wrap gap-4">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-purple-600 text-white font-poppins font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Open Full Admin Panel
            </a>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 font-poppins font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
