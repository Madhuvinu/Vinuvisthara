'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, ShoppingCart, Heart } from 'lucide-react';
import { logger } from '@/utils/logger';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadUser();
    loadCartCount();
  }, []);

  const loadUser = () => {
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const auth = JSON.parse(authData);
        setUser(auth.user);
      }
    } catch (error) {
      logger.error('Failed to load user from storage', error as Error);
    }
  };

  const loadCartCount = async () => {
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const { api } = await import('@/lib/api');
        const cart = await api.getCart();
        const count = cart.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
        setCartCount(count);
      }
    } catch (error) {
      // Ignore - user might not be logged in
    }
  };

  const handleLogout = () => {
    logger.info('User logged out');
    localStorage.removeItem('auth');
    setUser(null);
    router.push('/');
  };

  const handleSearchSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      return;
    }
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <>
      {/* Top Announcement Bar - Exactly like Euphoria */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gray-900 text-white text-xs md:text-sm py-2.5 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <span className="font-poppins font-semibold">FREE SHIPPING on orders above ₹999</span>
          <div className="hidden md:flex items-center gap-3 font-poppins text-xs">
            <Link href="/stores" className="hover:text-purple-300 transition-colors">Our Stores</Link>
            <span>|</span>
            {user ? (
              <>
                <span className="text-purple-300">{user.firstName || user.email}</span>
                <span>|</span>
                <button onClick={handleLogout} className="hover:text-purple-300 transition-colors">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-purple-300 transition-colors">Login</Link>
                <span>|</span>
                <Link href="/register" className="hover:text-purple-300 transition-colors">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header - Black bar like Euphoria */}
      <header className="fixed top-8 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Hamburger Menu - Left */}
            <button
              onClick={onMenuClick}
              className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>

            {/* Center Logo */}
            <Link 
              href="/" 
              className="absolute left-1/2 -translate-x-1/2 text-2xl md:text-3xl font-playfair font-bold text-white hover:text-purple-300 transition-colors italic"
              style={{ fontStyle: 'italic' }}
            >
              Vinuvisthara
            </Link>

            {/* Center Navigation - Hidden on mobile, shown on desktop */}
            <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
              <Link href="/products" className="text-white font-poppins text-sm hover:text-purple-300 transition-colors border-b-2 border-white pb-1">
                Products
              </Link>
              <Link href="/collections" className="text-white font-poppins text-sm hover:text-purple-300 transition-colors">
                Collections
              </Link>
              <Link href="/about" className="text-white font-poppins text-sm hover:text-purple-300 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-white font-poppins text-sm hover:text-purple-300 transition-colors">
                Contact
              </Link>
            </nav>

            {/* Right Navigation - Search, Cart, Wishlist */}
            <div className="flex items-center space-x-3">
              {/* Search Bar - Exactly like Euphoria */}
              <form
                onSubmit={handleSearchSubmit}
                className="hidden md:flex items-center bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 transition-colors border border-white/20"
                role="search"
              >
                <button
                  type="submit"
                  className="text-white mr-2 flex items-center justify-center focus:outline-none"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search"
                  className="bg-transparent border-none outline-none text-white placeholder-white/70 font-poppins text-sm w-32"
                />
              </form>

              {/* Cart Icon - With badge like Euphoria */}
              <Link 
                href="/cart" 
                className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 rounded-full w-5 h-5 text-xs flex items-center justify-center font-semibold bg-white text-black border border-gray-200">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Wishlist Icon */}
              <Link 
                href="/wishlist" 
                className="hidden md:flex w-10 h-10 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              >
                <Heart className="w-5 h-5 text-white" />
              </Link>

              {/* Admin Links */}
              {user?.role === 'admin' && (
                <>
                  <Link 
                    href="/admin/slider" 
                    className="hidden lg:block px-3 py-1.5 text-sm font-poppins text-white hover:text-purple-300 transition-colors"
                  >
                    Slider
                  </Link>
                  <a 
                    href={process.env.NEXT_PUBLIC_MEDUSA_ADMIN_URL || 'http://localhost:9001/app'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hidden lg:block px-3 py-1.5 text-sm font-poppins text-white hover:text-purple-300 transition-colors"
                  >
                    Admin
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
