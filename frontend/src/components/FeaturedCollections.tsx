'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { logger } from '@/utils/logger';
import Image from 'next/image';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  card_width?: string | null;
  card_height?: string | null;
  image_fit?: string;
  image_position?: string;
  image_scale?: number;
  image_align_horizontal?: string;
  image_align_vertical?: string;
  image_offset_x?: number;
  image_offset_y?: number;
  spacing?: number;
  aspect_ratio?: string;
  order: number;
  is_active: boolean;
}

export default function FeaturedCollections() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionBackground, setSectionBackground] = useState<string>('linear-gradient(180deg, #FBF6F1, #F3EADF)');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!scrollContainerRef.current || categories.length === 0) return;

    const scrollContainer = scrollContainerRef.current;
    const cardWidth = isMobile ? 200 : 280; // Card width + gap
    const gap = isMobile ? 16 : 24;
    const scrollAmount = cardWidth + gap;

    const autoScroll = () => {
      if (scrollContainer) {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const currentScroll = scrollContainer.scrollLeft;

        if (currentScroll >= maxScroll - 10) {
          // Reset to beginning
          scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll to next card
          scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    };

    // Start auto-scroll
    autoScrollIntervalRef.current = setInterval(autoScroll, 3000); // Change every 3 seconds

    // Pause on hover
    const handleMouseEnter = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };

    const handleMouseLeave = () => {
      autoScrollIntervalRef.current = setInterval(autoScroll, 3000);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [categories, isMobile]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        logger.info('Fetching categories for FeaturedCollections');
        const response = await api.getCategories();
        
        // Handle both old format (array) and new format (object with categories and section_background)
        let categoriesData: Category[] = [];
        let background = 'linear-gradient(180deg, #FBF6F1, #F3EADF)';
        
        if (Array.isArray(response)) {
          // Old format - just array of categories
          categoriesData = response;
        } else if (response && response.categories) {
          // New format - object with categories and section_background
          categoriesData = response.categories || [];
          if (response.section_background) {
            // Use gradient if available, otherwise use color
            background = response.section_background.gradient || 
                        response.section_background.color || 
                        background;
          }
        } else {
          categoriesData = [];
        }
        
        logger.info('Categories fetched successfully', { count: categoriesData.length });
        
        // Filter active categories and sort by order
        const activeCategories = (categoriesData || [])
          .filter((cat: Category) => cat.is_active)
          .sort((a: Category, b: Category) => a.order - b.order);
        
        setCategories(activeCategories);
        setSectionBackground(background);
      } catch (error) {
        logger.error('Failed to fetch categories', error as Error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 mt-16 md:mt-20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-4">
              Our Collections
            </h2>
            <p className="text-gray-600 font-poppins text-lg">
              Discover our curated selection
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null; // Don't show section if no categories
  }

  return (
    <section 
      className="py-20 px-4 relative mt-16 md:mt-20"
      style={{
        background: sectionBackground,
        position: 'relative',
        minHeight: '100vh',
      }}
    >
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Elegant frame wrapper with warm light background */}
        <div 
          className="rounded-2xl p-8 md:p-12 relative z-10"
          style={{
            border: '2px solid rgba(220, 200, 180, 0.4)',
            background: 'linear-gradient(145deg, rgba(255, 252, 248, 0.98), rgba(250, 245, 240, 0.95))',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 
              className="text-4xl md:text-5xl font-playfair font-bold mb-4 drop-shadow-sm"
              style={{ color: '#1f2937' }}
            >
              Our Collections
            </h2>
            <p 
              className="text-gray-700 font-poppins text-lg drop-shadow-sm"
              style={{ color: '#1f2937' }}
            >
              Discover our curated selection
            </p>
          </motion.div>

          {/* Horizontal Scrolling Carousel Container */}
          <div className="relative">
          {/* Navigation Arrows */}
          {categories.length > 0 && (
            <>
              <button
                onClick={() => {
                  if (scrollContainerRef.current) {
                    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
                    scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                  }
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-gray-700 group-hover:text-gray-900" />
              </button>
              <button
                onClick={() => {
                  if (scrollContainerRef.current) {
                    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
                    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                  }
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-gray-700 group-hover:text-gray-900" />
              </button>
            </>
          )}

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
            >
              {categories.map((category, index) => {
            // Get aspect ratio from category or default to 4:5
            const aspectRatio = category.aspect_ratio || '4:5';
            const aspectRatioClass = aspectRatio === '1:1' ? 'aspect-square' :
                                    aspectRatio === '4:3' ? 'aspect-[4/3]' :
                                    aspectRatio === '16:9' ? 'aspect-video' :
                                    aspectRatio === '4:5' ? 'aspect-[4/5]' :
                                    aspectRatio === '3:4' ? 'aspect-[3/4]' :
                                    'aspect-[4/5]'; // default
            
            // Get image fit from category or default to cover
            const imageFit = category.image_fit || 'cover';
            
            // Get image position from category or default to center
            const imagePosition = category.image_position || 'center';
            
            // Get new alignment options
            const imageScale = category.image_scale ?? 1.0;
            const alignH = category.image_align_horizontal || 'center';
            const alignV = category.image_align_vertical || 'center';
            const offsetX = category.image_offset_x ?? 0;
            const offsetY = category.image_offset_y ?? 0;
            
            // Build object position from alignment and offsets
            // Convert alignment to object-position values
            let objectPositionX = '50%';
            if (alignH === 'left') objectPositionX = '0%';
            else if (alignH === 'right') objectPositionX = '100%';
            else if (alignH === 'center') objectPositionX = '50%';
            
            let objectPositionY = '50%';
            if (alignV === 'top') objectPositionY = '0%';
            else if (alignV === 'bottom') objectPositionY = '100%';
            else if (alignV === 'center') objectPositionY = '50%';
            
            // Apply offsets using calc() for pixel adjustments
            let finalObjectPositionX = objectPositionX;
            let finalObjectPositionY = objectPositionY;
            
            if (offsetX !== 0) {
              // Convert percentage to calc with offset
              const baseValue = parseFloat(objectPositionX);
              finalObjectPositionX = `calc(${objectPositionX} + ${offsetX}px)`;
            }
            
            if (offsetY !== 0) {
              finalObjectPositionY = `calc(${objectPositionY} + ${offsetY}px)`;
            }
            
            const finalObjectPosition = `${finalObjectPositionX} ${finalObjectPositionY}`;
            
            // Get spacing from category or default to 16
            const spacing = category.spacing || 16;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`${aspectRatioClass} flex-shrink-0 ${isMobile ? 'w-[200px] min-w-[200px]' : 'w-[280px] min-w-[280px]'}`}
                style={{
                  marginRight: `${spacing || 16}px`,
                }}
              >
                <Link
                  href={`/collections/${category.slug}`}
                  className="group collection-card block relative w-full h-full rounded-xl overflow-hidden shadow-md"
                >
                  {/* Category Image or Gradient Background */}
                  {category.image ? (
                    <>
                      {/* Wrapper for base scale to allow hover zoom to work */}
                      <div 
                        className="absolute inset-0 w-full h-full"
                        style={{
                          transform: imageScale !== 1.0 ? `scale(${imageScale})` : 'none',
                          transformOrigin: `${objectPositionX} ${objectPositionY}`,
                        }}
                      >
                        <img
                          src={category.image}
                          alt={category.name}
                          className="collection-card-image absolute inset-0 w-full h-full"
                          style={{
                            objectFit: imageFit as 'cover' | 'contain' | 'fill' | 'none',
                            objectPosition: finalObjectPosition,
                          }}
                          onError={(e) => {
                            // Fallback to gradient if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const gradient = document.createElement('div');
                              gradient.className = 'absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400';
                              parent.insertBefore(gradient, target);
                            }
                          }}
                        />
                      </div>
                      {/* Dark Gradient Overlay for Text Readability */}
                      <div className="collection-overlay absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent group-hover:from-black/65 transition-all duration-400" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400" />
                  )}
                  
                  {/* Category Name Overlay with Animation */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end z-10 pb-3 md:pb-4 px-2 md:px-3">
                    <h3 className="collection-title text-base md:text-xl lg:text-2xl font-playfair font-bold text-white text-center drop-shadow-lg leading-tight">
                      {category.name}
                    </h3>
                    {/* View Collection CTA - Different text for mobile */}
                    <p className="collection-cta text-xs md:text-sm font-poppins font-medium text-white/90 mt-1 md:mt-2 hidden md:block">
                      View Collection →
                    </p>
                    <p className="collection-cta text-xs font-poppins font-medium text-white/90 mt-1 md:hidden">
                      Shop Now →
                    </p>
                  </div>
                </Link>
              </motion.div>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
