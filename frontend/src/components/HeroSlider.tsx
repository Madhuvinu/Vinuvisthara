'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CategoryStrip from './CategoryStrip';
import RatWithSaree from './RatWithSaree';
import { api } from '@/lib/api';
import { useHeaderColor } from '@/contexts/HeaderColorContext';

interface SliderItem {
  id: number | string;
  image_url: string;
  title?: string;
  description?: string;
  link?: string;
  button_text?: string;
  button_text_color?: string | null;
  button_background_color?: string | null;
  text_color?: string | null;
  order?: number;
  object_fit?: string;
  object_position?: string;
  image_zoom?: number;
  image_scale_x?: number;
  image_scale_y?: number;
  mobile_object_fit?: string | null;
  mobile_object_position?: string | null;
  mobile_image_zoom?: number | null;
  mobile_image_scale_x?: number | null;
  mobile_image_scale_y?: number | null;
  mobile_image_url?: string | null;
  mobile_height?: number | null;
  mobile_padding_top?: number;
  mobile_padding_right?: number;
  mobile_padding_bottom?: number;
  mobile_padding_left?: number;
  mobile_margin_top?: number;
  mobile_margin_right?: number;
  mobile_margin_bottom?: number;
  mobile_margin_left?: number;
  mobile_full_width?: boolean;
  header_color?: string | null;
  sparkle_effect_enabled?: boolean;
  sparkle_color?: string | null;
  sparkle_speed?: number;
}

export default function HeroSlider() {
  const { setHeaderColor, setSparkleSettings } = useHeaderColor();
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const active = sliders[activeIndex];

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // CRITICAL: Inject CSS to override global img height: auto
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        img.slider-hero-image,
        img.slider-hero-image-mobile {
          height: 100% !important;
          min-height: 100% !important;
          max-height: 100% !important;
          width: 100% !important;
        }
        .hero-slider-section {
          min-height: 200px !important;
        }
        .hero-slider-section > div:first-child {
          min-height: 200px !important;
        }
      `;
      document.head.appendChild(style);
      
      // Cleanup on unmount
      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, []);

  // Update header color and sparkle settings when active slide changes
  useEffect(() => {
    // Don't update if slider data hasn't loaded yet (prevents showing wrong color on refresh)
    if (loading || !active) {
      // Keep default gradient until slider loads - don't set any color
      return;
    }

    // Only use the slider's header_color if it's explicitly set in admin
    // If null/undefined/empty, don't change the color (Header will keep default gradient)
    if (active.header_color && active.header_color.trim() !== '') {
      setHeaderColor(active.header_color);
    }
    // If no header_color is set, don't call setHeaderColor - Header will use default gradient

    // Update sparkle settings
    setSparkleSettings({
      enabled: active.sparkle_effect_enabled !== false,
      color: active.sparkle_color || '#ffffff',
      speed: active.sparkle_speed || 15,
    });
  }, [
    loading,
    active?.id,
    active?.header_color,
    active?.sparkle_effect_enabled,
    active?.sparkle_color,
    active?.sparkle_speed,
    setHeaderColor,
    setSparkleSettings,
  ]);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const data = await api.getSliders();
        setSliders(Array.isArray(data) ? data : []);
      } catch (e) {
        // Fallback slider for testing when API is not available
        setSliders([{
          id: 'fallback-1',
          image_url: '/slider/slide1.png',
          title: 'Elevate Your Style',
          description: 'with VinuVishtra',
          link: '/collections/all',
          button_text: 'Explore Collection',
          object_fit: 'cover',
          object_position: 'center center',
          image_zoom: 1,
          header_color: null,
          sparkle_effect_enabled: true,
          sparkle_color: '#ffffff',
          sparkle_speed: 15,
        }]);
      } finally {
        setLoading(false);
      }
    };
    fetchSliders();
  }, []);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const t = setInterval(() => {
      setActiveIndex((i) => (i + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(t);
  }, [sliders.length]);

  // Use mobile image if on mobile and it exists, otherwise use desktop image
  const bgImage = isMobile && active?.mobile_image_url 
    ? active.mobile_image_url 
    : (active?.image_url || null);
  
  // Use mobile settings if on mobile and they exist, otherwise use desktop settings
  const objectFit = isMobile && active?.mobile_object_fit 
    ? active.mobile_object_fit 
    : (active?.object_fit ?? 'cover');
  
  const objectPosition = isMobile && active?.mobile_object_position 
    ? active.mobile_object_position 
    : (active?.object_position ?? 'right center');
  
  const baseZoom = isMobile && active?.mobile_image_zoom !== null && active?.mobile_image_zoom !== undefined
    ? Math.min(2, Math.max(0.5, Number(active.mobile_image_zoom) || 1))
    : Math.min(2, Math.max(0.5, Number(active?.image_zoom) || 1));
  
  const imageZoom = baseZoom;

  // Desktop-only horizontal stretch (scaleX). Keep mobile unchanged.
  const imageScaleX = isMobile
    ? 1
    : Math.min(2, Math.max(0.5, Number(active?.image_scale_x) || 1));

  const imageScaleY = isMobile
    ? 1
    : Math.min(2, Math.max(0.5, Number(active?.image_scale_y) || 1));

  // Mobile-only stretch (independent from desktop)
  const mobileImageScaleX = isMobile
    ? Math.min(2, Math.max(0.5, Number(active?.mobile_image_scale_x) || 1))
    : 1;

  const mobileImageScaleY = isMobile
    ? Math.min(2, Math.max(0.5, Number(active?.mobile_image_scale_y) || 1))
    : 1;
  
  // Mobile layout settings
  const mobileHeight = isMobile && active?.mobile_height ? `${active.mobile_height}px` : null;
  const mobilePadding = isMobile ? {
    // For slide 1: remove paddingTop to allow slider to move up and cover gap
    // For other slides: use admin padding settings
    paddingTop: activeIndex === 0 ? '0px' : (active?.mobile_padding_top !== undefined && active?.mobile_padding_top !== null ? `${active.mobile_padding_top}px` : undefined),
    paddingRight: active?.mobile_padding_right !== undefined && active?.mobile_padding_right !== null ? `${active.mobile_padding_right}px` : undefined,
    paddingBottom: active?.mobile_padding_bottom !== undefined && active?.mobile_padding_bottom !== null ? `${active.mobile_padding_bottom}px` : undefined,
    paddingLeft: active?.mobile_padding_left !== undefined && active?.mobile_padding_left !== null ? `${active.mobile_padding_left}px` : undefined,
  } : {};
  
  const mobileMargin = isMobile ? {
    marginTop: active?.mobile_margin_top !== undefined ? `${active.mobile_margin_top}px` : undefined,
    marginRight: active?.mobile_margin_right !== undefined ? `${active.mobile_margin_right}px` : undefined,
    marginBottom: active?.mobile_margin_bottom !== undefined ? `${active.mobile_margin_bottom}px` : undefined,
    marginLeft: active?.mobile_margin_left !== undefined ? `${active.mobile_margin_left}px` : undefined,
  } : {};
  
  // Full width on mobile
  const mobileFullWidth = isMobile && active?.mobile_full_width;


  return (
    <section 
      className={`relative overflow-x-hidden hero-slider-section ${isMobile ? 'w-screen' : 'w-full'} ${mobileFullWidth ? '-mx-0' : 'sm:mx-0'}`}
      style={{
        ...mobileMargin,
        ...(isMobile && {
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
          marginTop: active?.mobile_margin_top !== undefined ? `${active.mobile_margin_top}px` : '-8px',
          paddingLeft: '0',
          paddingRight: '0',
        }),
        ...(!isMobile && active?.mobile_full_width ? {
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
        } : {}),
      }}
    >
      {/* Mobile: Match desktop layout | Desktop: Full height slider */}
      {isMobile ? (
        <div
          className="relative w-full overflow-hidden"
          style={{
            height: mobileHeight || '240px',
            minHeight: mobileHeight || '240px',
            width: '100%',
            backgroundColor: bgImage ? (activeIndex === 0 ? 'transparent' : '#f3f4f6') : '#f3f4f6',
            // Move slide 1 up to cover gap, other slides use admin margin settings
            marginTop: activeIndex === 0 ? '-7px' : (active?.mobile_margin_top !== undefined ? `${active.mobile_margin_top}px` : '0'),
            ...mobilePadding,
          }}
        >
          {loading && !bgImage && (
            <div className="absolute inset-0 animate-pulse bg-gray-300" />
          )}
          {bgImage && (
            <>
              <div 
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{
                  margin: activeIndex === 0 ? '-3px' : '0',
                  width: activeIndex === 0 ? 'calc(100% + 6px)' : '100%',
                  height: activeIndex === 0 ? 'calc(100% + 6px)' : '100%',
                  left: activeIndex === 0 ? '-3px' : '0',
                  top: activeIndex === 0 ? '-3px' : '0',
                }}
              >
                <img
                  src={bgImage}
                  alt=""
                  className="absolute inset-0 w-full h-full"
                  style={{
                    // Always respect admin settings (no hard-coded first-slide overrides)
                    objectFit: objectFit as React.CSSProperties['objectFit'],
                    objectPosition: objectPosition,
                    transform: isMobile
                      ? `scaleX(${mobileImageScaleX || 1}) scaleY(${mobileImageScaleY || 1}) scale(${imageZoom || 1})`
                      : `scaleX(${imageScaleX || 1}) scaleY(${imageScaleY || 1}) scale(${imageZoom || 1})`,
                    transformOrigin: 'center center',
                    width: '100%',
                    height: '100%',
                    minWidth: '100%',
                    minHeight: '100%',
                  }}
                />
              </div>
              {/* Gradient overlay - match desktop */}
              <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                  background: 'linear-gradient(to right, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.12) 38%, transparent 65%), radial-gradient(ellipse 80% 50% at 70% 50%, rgba(255,200,120,0.08) 0%, transparent 60%)',
                }}
              />
              {/* Content - Match desktop layout exactly */}
              <div className="absolute inset-0 z-10 flex items-center px-4 sm:px-6 md:px-0">
                <div className="w-full sm:max-w-[600px] pl-0 sm:pl-4 md:pl-12 lg:pl-16">
                  {active?.title ? (
                    <h1 
                      className="font-serif text-lg sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-2 leading-tight break-words"
                      style={{ color: active.text_color || '#ffffff' }}
                    >
                      {active.title.split('\n').map((line, i) => (
                        <span key={i} className="block">
                          {line}
                        </span>
                      ))}
                      {active.description && (
                        <span className="block text-sm sm:text-2xl md:text-3xl lg:text-4xl mt-1 sm:mt-2 break-words">
                          {active.description}
                        </span>
                      )}
                    </h1>
                  ) : null}
                  {active?.button_text && (
                    <a
                      href={active.link || '/collections/all'}
                      className="inline-block mt-3 sm:mt-6 px-5 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white rounded border border-white/30 transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor: active.button_background_color || '#1c0303',
                        color: active.button_text_color || '#ffffff',
                      }}
                    >
                      {active.button_text}
                    </a>
                  )}
                </div>
              </div>
              {/* Slider dots */}
              {sliders.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:gap-2">
                  {sliders.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Slide ${index + 1}`}
                      className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-colors touch-manipulation ${
                        index === activeIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div
          className="relative w-full overflow-hidden bg-gray-100 sm:h-[280px] md:h-[450px] lg:h-[480px]"
        >
        {/* Background: backend image with object-fit, object-position, zoom */}

        <div className="absolute inset-0 overflow-hidden bg-transparent sm:bg-gray-200">
          {loading && !bgImage && (
            <div className="absolute inset-0 animate-pulse bg-gray-300" />
          )}
          {bgImage && (
            <>
              <div 
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{
                  margin: activeIndex === 0 ? '-3px' : '0',
                  width: activeIndex === 0 ? 'calc(100% + 6px)' : '100%',
                  height: activeIndex === 0 ? 'calc(100% + 6px)' : '100%',
                  left: activeIndex === 0 ? '-3px' : '0',
                  top: activeIndex === 0 ? '-3px' : '0',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bgImage}
                  alt=""
                  className="absolute inset-0 w-full h-full slider-hero-image slider-hero-image-mobile transition-opacity duration-500 slider-image-zoom"
                  data-original-position={objectPosition}
                  style={{
                    // Always respect admin settings (no hard-coded first-slide overrides)
                    objectFit: objectFit as React.CSSProperties['objectFit'],
                    objectPosition: objectPosition,
                    transform: isMobile
                      ? `scaleX(${mobileImageScaleX || 1}) scaleY(${mobileImageScaleY || 1}) scale(${imageZoom || 1})`
                      : `scaleX(${imageScaleX || 1}) scaleY(${imageScaleY || 1}) scale(${imageZoom || 1})`,
                    transformOrigin: 'center center',
                    width: '100%',
                    height: '100%',
                    minWidth: '100%',
                    minHeight: '100%',
                  } as React.CSSProperties}
                />
              </div>
              
              {/* Gradient overlay */}
              <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.12) 38%, transparent 65%), radial-gradient(ellipse 80% 50% at 70% 50%, rgba(255,200,120,0.08) 0%, transparent 60%)',
                }}
              />
            </>
          )}
        </div>

        {/* Left-aligned content - absolute on mobile to not affect height, centered on tablet+ */}
        <div className="absolute top-0 left-0 z-10 flex w-full px-2 sm:inset-0 sm:items-center sm:px-6 md:px-0">
          <div className="mt-2 sm:mt-0 w-full sm:max-w-[600px] pl-0 sm:pl-4 md:pl-12 lg:pl-16 relative z-20">
            {active?.title ? (
              <h1 
                className="font-serif text-xs sm:text-3xl md:text-4xl lg:text-5xl leading-tight text-white break-words overflow-hidden"
                style={{ 
                  color: active.text_color || '#ffffff',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                }}
              >
                {active.title.split('\n').map((line, i) => (
                  <span key={i} className="block break-words whitespace-normal overflow-hidden">
                    {line}
                  </span>
                ))}
                {active.description && (
                  <span 
                    className="block text-[10px] sm:text-2xl md:text-3xl lg:text-4xl mt-0.5 break-words whitespace-normal overflow-hidden"
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%',
                    }}
                  >
                    {(() => {
                      // Remove any repeated text patterns and limit length
                      let desc = String(active.description || '').trim();
                      // Remove common repetition patterns
                      if (desc.includes('Drapped dreamsDrapped dreams')) {
                        desc = desc.replace(/Drapped dreamsDrapped dreams/g, 'Drapped dreams');
                      }
                      // Limit to 40 characters on mobile
                      if (desc.length > 40) {
                        desc = desc.substring(0, 40) + '...';
                      }
                      return desc;
                    })()}
                  </span>
                )}
              </h1>
            ) : (
              <h1 
                className="font-serif text-xs sm:text-3xl md:text-4xl lg:text-5xl leading-tight text-white break-words overflow-hidden"
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                }}
              >
                Elevate Your Style
                <br />
                <span className="text-[10px] sm:text-2xl md:text-3xl lg:text-4xl">with VinuVishtra</span>
              </h1>
            )}
            <Link
              href={active?.link || '/collections/all'}
              className="relative z-20 mt-1.5 sm:mt-6 inline-block rounded border border-white/30 px-2 py-0.5 sm:px-6 sm:py-3 text-[8px] sm:text-base transition-colors hover:opacity-90 active:opacity-90 cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: active?.button_background_color || '#0f766e',
                color: active?.button_text_color || '#ffffff',
                borderColor: active?.button_text_color ? `${active.button_text_color}30` : 'rgba(255,255,255,0.3)',
                pointerEvents: 'auto',
              }}
            >
              {active?.button_text || 'Explore Collection'}
            </Link>
          </div>
        </div>

        {/* Slider dots (only if multiple) - smaller on mobile */}
        {sliders.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:gap-2">
            {sliders.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-colors touch-manipulation ${
                  i === activeIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      )}

      {/* Category section: section stays put; only cards + tagggy move up to touch slider */}
      <section
        className="category-section relative z-[20] w-full overflow-visible -mt-6 sm:mt-0 pt-6 sm:pt-8 pb-10 sm:pb-14"
        aria-label="Shop by category"
      >
        {/* Animated rat with floating saree */}
        <RatWithSaree />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-2 sm:px-4 -mt-[12px] sm:-mt-[28px] md:-mt-[48px] lg:-mt-[64px]">
          {/* Sarees: moved further outside left/right so visible properly. */}
          <img
            src="/images/tagggy.png"
            alt=""
            width={220}
            height={200}
            loading="lazy"
            decoding="async"
            className="block absolute -bottom-8 sm:-bottom-12 -left-12 sm:-left-28 lg:-left-32 xl:-left-40 z-10 w-[100px] sm:w-[160px] lg:w-[190px] xl:w-[220px] max-h-[150px] sm:max-h-[200px] object-contain object-left-bottom pointer-events-none select-none"
          />
          <img
            src="/images/tagggy.png"
            alt=""
            width={220}
            height={200}
            loading="lazy"
            decoding="async"
            className="block absolute -bottom-8 sm:-bottom-12 -right-12 sm:-right-28 lg:-right-32 xl:-right-40 z-10 w-[100px] sm:w-[160px] lg:w-[190px] xl:w-[220px] max-h-[150px] sm:max-h-[200px] object-contain object-right-bottom pointer-events-none select-none scale-x-[-1]"
          />
          {/* Cards only: no frame, no bg, no padding. */}
          <div className="relative z-30 w-full -mt-8 sm:mt-0">
            <CategoryStrip />
          </div>
        </div>
      </section>
    </section>
  );
}
