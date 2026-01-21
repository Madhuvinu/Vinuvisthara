'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronRight } from 'lucide-react';

interface Category {
  name: string;
  href: string;
  icon?: string;
}

const categories: Category[] = [
  { name: 'Silk Sarees', href: '/products?category=silk' },
  { name: 'Banarasi Sarees', href: '/products?category=banarasi' },
  { name: 'Bridal Collection', href: '/products?category=wedding' },
  { name: 'Contemporary Sarees', href: '/products?category=casual' },
  { name: 'Cotton Sarees', href: '/products?category=cotton' },
  { name: 'Party Wear', href: '/products?category=party_wear' },
  { name: 'Traditional Sarees', href: '/products?category=traditional' },
  { name: 'Accessories', href: '/products?category=accessories' },
];

export default function SideNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Menu Button - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-6 z-[100] bg-gray-900/95 backdrop-blur-md p-3 rounded-lg shadow-xl hover:bg-gray-800 transition-all border border-gray-700 hover:scale-105"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Overlay for mobile/tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm lg:bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Panel - Closed by default */}
      <aside
        className={`fixed top-0 left-0 h-screen w-80 bg-white/98 backdrop-blur-lg shadow-2xl z-[95] transform transition-transform duration-300 ease-in-out border-r border-gray-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50/50 to-white">
            <h2 className="text-2xl font-playfair font-bold text-gray-900">Categories</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-900 transition p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categories List */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {categories.map((category, index) => (
                <li key={index}>
                  <Link
                    href={category.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-4 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
                  >
                    <span className="font-poppins font-medium text-base">{category.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50/50">
            <Link
              href="/products"
              className="block w-full text-center py-4 px-6 bg-gray-900 text-white rounded-xl font-poppins font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              onClick={() => setIsOpen(false)}
            >
              View All Products
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
