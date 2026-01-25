'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

/** Animated rat with dynamic banner text that runs slowly left-to-right and right-to-left */
export default function RatWithSaree() {
  const [bannerText, setBannerText] = useState<string | null>(null);

  useEffect(() => {
    const fetchBannerText = async () => {
      try {
        const sliders = await api.getSliders();
        // Get banner text from the first active slider that has banner_text
        const sliderWithBanner = sliders.find((s: any) => s.banner_text && s.banner_text.trim() !== '');
        if (sliderWithBanner?.banner_text) {
          setBannerText(sliderWithBanner.banner_text);
        }
      } catch (error) {
        // Silently fail - banner is optional
      }
    };

    fetchBannerText();
  }, []);

  return (
    <div
      className="pointer-events-none absolute bottom-0 left-0 w-full h-32 z-[5] overflow-visible"
      aria-hidden
    >
      <div className="rat-running-container relative w-full h-full overflow-visible">
        {/* Rat Image - bigger with walking animation */}
        <div className="rat-wrapper absolute bottom-0 rat-run-slow mt-2 sm:mt-3">
          <img
            src="/ratu-removebg-preview.png"
            alt=""
            className="rat-image rat-walking"
            style={{
              width: '55px',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        {/* Custom Flow Banner attached to the rat - only show if banner text exists */}
        {bannerText && (
          <div className="rat-banner absolute bottom-8 rat-run-slow banner-float" style={{ marginLeft: '50px', zIndex: 2 }}>
            {/* Banner with custom flow design */}
            <div className="banner-flow-container relative">
              {/* Flowing ribbon effect */}
              <div className="banner-ribbon absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-60"></div>
              
              {/* Main banner content */}
              <div className="banner-content relative bg-gradient-to-r from-red-600 via-pink-600 to-red-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-2xl border-2 border-yellow-400 overflow-hidden">
                {/* Shimmer effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent banner-shimmer"></div>
                
                {/* Content */}
                <div className="relative flex items-center gap-2 sm:gap-2.5">
                  <span className="text-sm sm:text-base font-bold animate-pulse">🎉</span>
                  <span className="text-xs sm:text-sm font-bold whitespace-nowrap font-poppins drop-shadow-lg">{bannerText}</span>
                  <span className="text-sm sm:text-base font-bold animate-pulse">🎉</span>
                </div>
                
                {/* Banner tail/pointer attached to rat */}
                <div className="absolute -left-3 bottom-2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-yellow-400 border-b-[8px] border-b-transparent"></div>
                
                {/* Decorative dots */}
                <div className="absolute top-1 left-2 w-1.5 h-1.5 bg-yellow-300 rounded-full opacity-70"></div>
                <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-yellow-300 rounded-full opacity-70"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
