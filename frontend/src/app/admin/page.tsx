'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Image, Package, ShoppingCart, Users, FileText, Tags, Gift } from 'lucide-react';
import { isAuthenticated } from '@/utils/auth';

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

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
        <div className="text-center">
          <h1 className="text-2xl font-playfair font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 font-poppins mb-6">
            Please login to access the admin panel
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-purple-600 text-white font-poppins font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </Link>
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
                href={`http://localhost:8000${section.url}`}
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
              href="http://localhost:8000/admin"
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
