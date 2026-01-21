'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, Search, ShoppingBag, User, LogOut } from 'lucide-react';
import { useSidePanel } from '@/hooks/useSidePanel';
import { useHeaderColor } from '@/contexts/HeaderColorContext';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { isAuthenticated, getCurrentUser, clearAuth, refreshAuth } from '@/utils/auth';

export default function Header() {
  const { isOpen, openPanel, closePanel } = useSidePanel();
  const { headerColor } = useHeaderColor();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  // Handle mounting for portal (required for SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update dropdown position when menu opens or window resizes
  useEffect(() => {
    if (showUserMenu && userMenuButtonRef.current) {
      const updatePosition = () => {
        const button = userMenuButtonRef.current;
        if (button) {
          const rect = button.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + window.scrollY + 8,
            right: window.innerWidth - rect.right,
          });
        }
      };
      
      updatePosition();
      
      // Update on scroll and resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showUserMenu]);

  useEffect(() => {
    // Load user info
    const loadUserInfo = () => {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        return true;
      } else {
        setUser(null);
        return false;
      }
    };
    
    loadUserInfo();
    
    // Fetch cart count from Laravel API (only if logged in)
    const fetchCartCount = async () => {
      if (!isAuthenticated()) {
        setCartCount(0);
        return;
      }
      
      try {
        const cartResponse = await api.getCart();
        if (cartResponse?.items) {
          const count = cartResponse.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          setCartCount(count);
        }
      } catch (error) {
        // Ignore - cart might not exist yet
        console.debug('Cart count fetch failed (cart may not exist yet):', error);
      }
    };
    fetchCartCount();
    
    // Refresh cart count and auth status periodically
    const interval = setInterval(() => {
      const authStatus = isAuthenticated();
      if (authStatus) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        fetchCartCount();
        // Refresh session on activity (extend by 30 minutes)
        refreshAuth();
      } else {
        setUser(null);
        setCartCount(0);
      }
    }, 5000); // Refresh every 5 seconds
    
    // Listen for auth changes
    const handleAuthChange = () => {
      loadUserInfo();
      if (isAuthenticated()) {
        fetchCartCount();
      } else {
        setCartCount(0);
      }
    };
    
    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);
  
  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setCartCount(0);
    setShowUserMenu(false);
    toast.success('Logged out successfully');
    router.push('/');
  };

  // Determine text color based on header background (light/dark)
  const getTextColor = (bgColor: string) => {
    // If it's a hex color, calculate brightness
    if (bgColor.startsWith('#')) {
      const rgb = hexToRgb(bgColor);
      if (rgb) {
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? 'text-gray-900' : 'text-white';
      }
    }
    // Default to white text for dark backgrounds
    return 'text-white';
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const textColorClass = getTextColor(headerColor);
  
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-[1000] backdrop-blur-md border-b ${textColorClass === 'text-white' ? 'border-white/20' : 'border-gray-200/50'}`}
      style={{ 
        backgroundColor: headerColor || '#1f2937',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="w-full overflow-x-auto">
        <div className="flex items-center justify-between h-20 pl-2 pr-2 md:pl-2 md:pr-8 min-w-0">
          {/* Left: Logo + Hamburger Menu + Brand Text */}
          <div className="flex items-center gap-3">
            {/* Logo at extreme left */}
            <Link
              href="/"
              className="flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
            >
              <Image
                src="/vinlogo.png"
                alt="Vinuvisthara Logo"
                width={45}
                height={45}
                className="object-contain w-9 h-9 md:w-11 md:h-11"
                style={{ minWidth: '36px', minHeight: '36px' }}
                priority
              />
            </Link>
            <button
              onClick={() => isOpen ? closePanel() : openPanel()}
              className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-gray-100/50 transition-colors"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              <Menu className={`w-6 h-6 ${textColorClass}`} />
            </button>
            <Link
              href="/"
              className={`text-xl md:text-2xl font-playfair font-bold ${textColorClass} hover:opacity-80 transition-opacity`}
            >
              Vinuvisthara
            </Link>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden md:flex items-center gap-5 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/products"
              className={`text-xs md:text-sm font-poppins font-medium ${textColorClass} hover:opacity-80 transition-opacity relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-current after:transition-all hover:after:w-full`}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className={`text-xs md:text-sm font-poppins font-medium ${textColorClass} hover:opacity-80 transition-opacity relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-current after:transition-all hover:after:w-full`}
            >
              About us
            </Link>
            <Link
              href="/blog"
              className={`text-xs md:text-sm font-poppins font-medium ${textColorClass} hover:opacity-80 transition-opacity relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-current after:transition-all hover:after:w-full`}
            >
              Blog
            </Link>
          </nav>

          {/* Right: Icons - Always visible on mobile */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <button
              className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg ${textColorClass === 'text-white' ? 'hover:bg-white/10' : 'hover:bg-gray-100/50'} transition-colors flex-shrink-0`}
              aria-label="Search"
            >
              <Search className={`w-4 h-4 md:w-5 md:h-5 ${textColorClass}`} />
            </button>

            {user && (
              <Link
                href="/cart"
                className={`relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg ${textColorClass === 'text-white' ? 'hover:bg-white/10' : 'hover:bg-gray-100/50'} transition-colors flex-shrink-0`}
                aria-label="Shopping cart"
              >
                <ShoppingBag className={`w-4 h-4 md:w-5 md:h-5 ${textColorClass}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Admin Link */}
            {user && (
              <Link
                href="/admin"
                className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg ${textColorClass === 'text-white' ? 'hover:bg-white/10' : 'hover:bg-gray-100/50'} transition-colors flex-shrink-0`}
                aria-label="Admin Panel"
                title="Admin Panel"
              >
                <svg className={`w-4 h-4 md:w-5 md:h-5 ${textColorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            )}

            {/* User Menu */}
            <div className="relative user-menu-container">
              {user ? (
                <div className="relative">
                  <button
                    ref={userMenuButtonRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                    }}
                    className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg ${textColorClass === 'text-white' ? 'hover:bg-white/10' : 'hover:bg-gray-100/50'} transition-colors flex-shrink-0`}
                    aria-label="User account"
                  >
                    <User className={`w-4 h-4 md:w-5 md:h-5 ${textColorClass}`} />
                  </button>
                  
                  {/* Profile Dropdown - Using Portal to ensure it's above all content */}
                  {showUserMenu && mounted && typeof window !== 'undefined' && createPortal(
                    <>
                      {/* Backdrop to close menu on outside click */}
                      <div
                        className="fixed inset-0 z-[1000]"
                        onClick={() => setShowUserMenu(false)}
                      />
                      {/* Dropdown Menu */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="fixed w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[1001]"
                        style={{
                          top: `${dropdownPosition.top}px`,
                          right: `${dropdownPosition.right}px`,
                        }}
                      >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.first_name || user.firstName} {user.last_name || user.lastName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{user.email}</p>
                      </div>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                    </>,
                    document.body
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg ${textColorClass === 'text-white' ? 'hover:bg-white/10' : 'hover:bg-gray-100/50'} transition-colors flex-shrink-0`}
                  aria-label="Login"
                >
                  <User className={`w-4 h-4 md:w-5 md:h-5 ${textColorClass}`} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
