'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, User } from 'lucide-react';
import { api } from '@/lib/api';
import { isAuthenticated, getCurrentUser, clearAuth } from '@/utils/auth';
import { useHeaderColor } from '@/contexts/HeaderColorContext';

const DEFAULT_HEADER_GRADIENT = 'linear-gradient(to right, #0f766e, #166534)'; // teal-800 to green-800
const CONTEXT_DEFAULT = '#1f2937';

// Sparkle Effect Component
const SparkleEffect = ({ enabled, color, speed }: { enabled: boolean; color: string; speed: number }) => {
  if (!enabled) return null;

  const getRgba = (col: string, opacity: number) => {
    if (col.startsWith('rgba')) {
      const match = col.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
      }
    }
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 255, g: 255, b: 255 };
    };
    const rgb = hexToRgb(col);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  };

  const sparkles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 1 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 6,
    duration: (speed * 0.6) + Math.random() * (speed * 0.8),
    direction: Math.random() > 0.5 ? 'down-right' : 'up-right',
    opacity: 0.5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className={`absolute rounded-full ${sparkle.direction === 'down-right' ? 'animate-sparkle-down-right' : 'animate-sparkle-up-right'}`}
          style={{
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            background: `radial-gradient(circle, ${getRgba(color, 0.7)} 0%, ${getRgba(color, 0.4)} 50%, transparent 100%)`,
            boxShadow: `0 0 2px ${getRgba(color, 0.5)}, 0 0 4px ${getRgba(color, 0.3)}`,
            animationDuration: `${sparkle.duration}s`,
            animationDelay: `${sparkle.delay}s`,
            opacity: sparkle.opacity,
            filter: 'blur(0.3px)',
          }}
        />
      ))}
    </div>
  );
};

export default function Header() {
  const router = useRouter();
  const { headerColor, sparkleSettings } = useHeaderColor();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Always use gradient by default unless slider explicitly sets a header_color
  // CONTEXT_DEFAULT (#1f2937) means "use gradient" - only use solid color if slider set a custom color
  const useGradient = !headerColor || headerColor === CONTEXT_DEFAULT || headerColor === '#1f2937';
  const headerStyle = useGradient
    ? { background: DEFAULT_HEADER_GRADIENT }
    : { backgroundColor: headerColor };

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
        // Cart may not exist yet - silently ignore
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
      } else {
        setUser(null);
        setCartCount(0);
      }
    }, 5000);
    
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
    router.push('/');
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchValue('');
  };

  const handleSearchSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const query = searchValue.trim();
    if (!query) {
      return;
    }
    router.push(`/products?search=${encodeURIComponent(query)}`);
    closeSearch();
  };

  useEffect(() => {
    if (!isSearchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSearch();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isSearchOpen]);

  return (
    <>
      <header className="relative z-50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div
        className="relative transition-colors duration-500"
        style={headerStyle}
      >
        <SparkleEffect 
          enabled={sparkleSettings.enabled}
          color={sparkleSettings.color}
          speed={sparkleSettings.speed}
        />
        <div className="relative flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 py-3 sm:py-4">
          {/* Logo on left - responsive sizing */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-playfair font-bold text-white hover:text-yellow-300 active:text-yellow-300 transition-colors touch-manipulation"
          >
            VinuVisthara
          </Link>

          {/* Center navigation - hidden on mobile, shown on lg+ */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/"
              className="text-white hover:text-yellow-300 transition-colors font-poppins text-sm"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-white hover:text-yellow-300 transition-colors font-poppins text-sm"
            >
              Sarees
            </Link>
            <Link
              href="/collections"
              className="text-white hover:text-yellow-300 transition-colors font-poppins text-sm"
            >
              Collections
            </Link>
            <Link
              href="/about"
              className="text-white hover:text-yellow-300 transition-colors font-poppins text-sm"
            >
              About Us
            </Link>
            <Link
              href="/offers"
              className="text-white hover:text-yellow-300 transition-colors font-poppins text-sm"
            >
              Offers
            </Link>
            <Link
              href="/blog"
              className="text-white hover:text-yellow-300 transition-colors font-poppins text-sm"
            >
              Blogs
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-yellow-300 transition-colors font-poppins text-sm"
            >
              Contact
            </Link>
          </nav>

          {/* Right side icons - touch-friendly on mobile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              className="text-white hover:text-yellow-300 active:text-yellow-300 transition-colors touch-manipulation p-1 -mr-1"
              aria-label="Search"
              onClick={openSearch}
            >
              <Search className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>
            
            {user ? (
              <button
                onClick={handleLogout}
                className="text-white hover:text-yellow-300 active:text-yellow-300 transition-colors touch-manipulation p-1 -mr-1"
                aria-label="User account"
              >
                <User className="w-5 h-5 sm:w-5 sm:h-5" />
              </button>
            ) : (
              <Link
                href="/login"
                className="text-white hover:text-yellow-300 active:text-yellow-300 transition-colors touch-manipulation p-1 -mr-1"
                aria-label="Login"
              >
                <User className="w-5 h-5 sm:w-5 sm:h-5" />
              </Link>
            )}
            
            <Link
              href="/cart"
              className="relative text-white hover:text-yellow-300 active:text-yellow-300 transition-colors touch-manipulation p-1"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-400 text-black text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {isSearchOpen && (
          <div className="px-4 sm:px-6 pb-4">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex flex-col gap-3 rounded-2xl border border-white/30 bg-white/95 text-gray-900 shadow-2xl backdrop-blur"
            >
              <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="hidden sm:flex items-center justify-center w-11 h-11 rounded-full bg-emerald-100 text-emerald-600">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  ref={searchInputRef}
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search sarees by color, fabric, occasion..."
                  className="flex-1 min-w-[160px] bg-transparent outline-none text-base placeholder-gray-400"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 pb-3 text-[11px] uppercase tracking-[0.35em] text-gray-500">
                <span>Press Enter</span>
                <span>Esc to close</span>
              </div>
            </form>
          </div>
        )}
      </div>
      </header>
    </>
  );
}
