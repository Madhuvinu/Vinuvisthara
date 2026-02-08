'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidePanel } from '@/hooks/useSidePanel';
import { api } from '@/lib/api';

const staticMenuItems = [
  { name: 'Home', href: '/' },
  { name: 'Sarees', href: '/products' },
  { name: 'Collections', href: '/collections' },
  { name: 'About Us', href: '/about' },
  { name: 'Offers', href: '/offers' },
  { name: 'Blogs', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export default function SidePanel() {
  const { isOpen, closePanel } = useSidePanel();
  const [collections, setCollections] = useState<Array<{ name: string; href: string }>>([]);

  useEffect(() => {
    // Fetch collections dynamically
    const fetchCollections = async () => {
      try {
        const response: unknown = await api.getCategories();
        let categoriesData: any[] = [];

        if (Array.isArray(response)) {
          categoriesData = response;
        } else if (
          response &&
          typeof response === 'object' &&
          'categories' in response &&
          Array.isArray((response as { categories?: any[] }).categories)
        ) {
          categoriesData = (response as { categories?: any[] }).categories || [];
        }
        const activeCollections = categoriesData
          .filter((cat: any) => cat.is_active)
          .map((cat: any) => ({
            name: cat.name,
            href: `/collections/${cat.slug}`,
          }));
        setCollections(activeCollections);
      } catch (error) {
        setCollections([]);
      }
    };

    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    ...staticMenuItems,
    ...collections,
  ];

  const panelVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={closePanel}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
          />

          {/* Side Panel */}
          <motion.aside
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 left-0 h-screen z-[100] bg-white shadow-2xl w-[85%] sm:w-[400px] max-w-md"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-playfair font-bold text-gray-900">Menu</h3>
                <button
                  onClick={closePanel}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto p-6">
                <ul className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={closePanel}
                        className="block py-4 px-4 text-gray-900 font-poppins font-medium text-lg hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {item.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
