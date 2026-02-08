'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, ShoppingBag, User } from 'lucide-react';
import { api } from '@/lib/api';
import { isAuthenticated, getCurrentUser, clearAuth } from '@/utils/auth';
import { useHeaderColor } from '@/contexts/HeaderColorContext';
import { useSidePanel } from '@/hooks/useSidePanel';

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

  const sparkles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 5,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 6,
    duration: (speed * 0.6) + Math.random() * (speed * 0.8),
    direction: Math.random() > 0.5 ? 'down-right' : 'up-right',
    opacity: 0.85,
  }));

  const StarSvg = ({ size, color }: { size: number; color: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} opacity={0.9}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className={`absolute ${sparkle.direction === 'down-right' ? 'animate-sparkle-down-right' : 'animate-sparkle-up-right'}`}
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            animationDuration: `${sparkle.duration}s`,
            animationDelay: `${sparkle.delay}s`,
            opacity: sparkle.opacity,
            filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.6))',
          }}
        >
          <StarSvg size={sparkle.size} color="#ffffff" />
        </div>
      ))}
    </div>
  );
};

export default function Header() {
  const router = useRouter();
  const { headerColor, sparkleSettings } = useHeaderColor();
  const { openPanel } = useSidePanel();
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openPanel}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo on left - responsive sizing */}
            <Link
              href="/"
              className="flex items-center gap-0 text-xl sm:text-2xl font-playfair font-bold hover:opacity-80 active:opacity-70 transition-opacity touch-manipulation"
            >
              <Image
                src="/otherlogo-Photoroom.png"
                alt="V"
                width={28}
                height={28}
                className="h-7 w-7 sm:h-8 sm:w-8 inline-block -mr-1"
                priority
              />
              <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent font-extrabold tracking-tight lg:tracking-wide">inuVisthara</span>
            </Link>
          </div>

          {/* Center navigation - hidden on mobile, shown on lg+ */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/"
              className="text-amber-500 hover:text-yellow-400 transition-colors font-poppins text-sm"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-amber-500 hover:text-yellow-400 transition-colors font-poppins text-sm"
            >
              Sarees
            </Link>
            <Link
              href="/collections"
              className="text-amber-500 hover:text-yellow-400 transition-colors font-poppins text-sm"
            >
              Collections
            </Link>
            <Link
              href="/about"
              className="text-amber-500 hover:text-yellow-400 transition-colors font-poppins text-sm"
            >
              About Us
            </Link>
            <Link
              href="/offers"
              className="text-amber-500 hover:text-yellow-400 transition-colors font-poppins text-sm"
            >
              Offers
            </Link>
            <Link
              href="/blog"
              className="text-amber-500 hover:text-yellow-400 transition-colors font-poppins text-sm"
            >
              Blogs
            </Link>
            <Link
              href="/contact"
              className="text-amber-500 hover:text-yellow-400 transition-colors font-poppins text-sm"
            >
              Contact
            </Link>
          </nav>

          {/* Right side icons - touch-friendly on mobile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Compact Search Input */}
            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg px-2.5 py-1.5 border border-amber-500/30 hover:border-amber-500/50 transition-colors">
              <Search className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent outline-none text-sm text-white placeholder-amber-500/50 w-32 focus:w-40 transition-all"
                />
              </form>
            </div>
            
            {/* Mobile search button */}
            <button
              className="sm:hidden text-amber-500 hover:text-yellow-400 active:text-yellow-400 transition-colors touch-manipulation p-1 -mr-1"
              aria-label="Search"
              onClick={openSearch}
            >
              <Search className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>
            
            {user ? (
              <button
                onClick={handleLogout}
                className="text-amber-500 hover:text-yellow-400 active:text-yellow-400 transition-colors touch-manipulation p-1 -mr-1"
                aria-label="User account"
              >
                <User className="w-5 h-5 sm:w-5 sm:h-5" />
              </button>
            ) : (
              <Link
                href="/login"
                className="text-amber-500 hover:text-yellow-400 active:text-yellow-400 transition-colors touch-manipulation p-1 -mr-1"
                aria-label="Login"
              >
                <User className="w-5 h-5 sm:w-5 sm:h-5" />
              </Link>
            )}
            
            <Link
              href="/cart"
              className="relative text-amber-500 hover:text-yellow-400 active:text-yellow-400 transition-colors touch-manipulation p-1"
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
          <div className="sm:hidden absolute inset-x-0 top-full z-40" onClick={closeSearch}>
            <div className="absolute -top-0 left-0 right-0 h-[100vh] bg-black/20" />
            <div className="relative px-4 py-4">
              <form
                onSubmit={handleSearchSubmit}
                onClick={(event) => event.stopPropagation()}
                className="relative flex items-center gap-3 rounded-lg border border-white/30 bg-white/95 text-gray-900 shadow-lg px-3 py-2"
              >
                <Search className="w-5 h-5 text-emerald-600" />
                <input
                  ref={searchInputRef}
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search sarees..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  className="text-gray-600 hover:text-gray-900 text-lg font-semibold"
                >
                  ✕
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      </header>
    </>
  );
}
