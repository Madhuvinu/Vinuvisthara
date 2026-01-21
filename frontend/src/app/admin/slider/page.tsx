'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SliderManagement() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Laravel Filament admin panel for slider management
    window.location.href = 'http://localhost:8000/admin/slider-images';
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      <div className="text-center">
        <div className="animate-pulse mb-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
        <h1 className="text-2xl font-playfair font-bold text-gray-900 mb-2">
          Redirecting to Slider Management...
        </h1>
        <p className="text-gray-600 font-poppins">
          Laravel Filament Admin Panel
        </p>
        <p className="text-sm text-gray-500 font-poppins mt-4">
          If you are not redirected automatically,{' '}
          <a 
            href="http://localhost:8000/admin/slider-images" 
            className="text-purple-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            click here
          </a>
        </p>
      </div>
    </div>
  );
}
