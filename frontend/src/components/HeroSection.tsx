'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHeaderColor } from '@/contexts/HeaderColorContext';

interface SlideImage {
  id: string;
  image_url: string;
  order: number;
  is_primary?: boolean;
}

interface Slide {
  id: string;
  imageUrl: string;
  images?: SlideImage[]; // All images for layered Polaroid effect
  title?: string;
  subtitle?: string;
  titleColor?: string;
  titleSize?: string;
  subtitleColor?: string;
  subtitleSize?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonTextColor?: string;
  buttonBackgroundColor?: string;
  isActive: boolean;
  displayOrder: number;
  backgroundColor?: string;
  gradientColor1?: string;
  gradientColor2?: string;
  gradientColor3?: string;
  headerColor?: string;
  sparkleEffectEnabled?: boolean;
  sparkleColor?: string;
  sparkleSpeed?: number;
  cardBackgroundColor?: string;
  cardBackgroundGradient?: string;
  imageInnerBackground?: string;
}

export default function HeroSection() {
  const { setHeaderColor } = useHeaderColor();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Update header color when slide changes
  useEffect(() => {
    if (slides.length > 0 && slides[currentIndex]?.headerColor) {
      setHeaderColor(slides[currentIndex].headerColor);
    }
  }, [currentIndex, slides, setHeaderColor]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        // Fetch slider images via Next.js API proxy
        const response = await fetch('/api/slider-images', {
          cache: 'no-cache', // Always fetch fresh (no-cache is more compatible)
        });
        
        if (response.ok) {
          const data = await response.json();
          
          const sliderImages = data.sliders || [];
          
          // Use all data: images, text, and background color
          if (sliderImages.length > 0) {
            const defaultSlide = getDefaultSlides()[0]; // Fallback for missing fields
            const slides = sliderImages.map((image: any, index: number) => ({
              id: image.id || `slide-${index}`,
              imageUrl: image.imageUrl,
              images: image.images || [],
              // Use text if provided, otherwise use defaults
              title: image.title || defaultSlide.title,
              subtitle: image.subtitle || defaultSlide.subtitle,
              // Use textColor from API for both title and subtitle, or fallback to defaults
              titleColor: image.textColor || defaultSlide.titleColor || '#ffffff',
              titleSize: image.titleSize || defaultSlide.titleSize || 'text-4xl',
              subtitleColor: image.textColor || defaultSlide.subtitleColor || '#ffffff',
              subtitleSize: image.subtitleSize || defaultSlide.subtitleSize || 'text-base',
              buttonText: image.buttonText || defaultSlide.buttonText,
              buttonLink: image.buttonLink || defaultSlide.buttonLink,
              buttonTextColor: image.buttonTextColor || image.button_text_color || '#000000',
              buttonBackgroundColor: image.buttonBackgroundColor || image.button_background_color || '#ffffff',
              // Use gradient colors from API, or fallback to default
              backgroundColor: image.backgroundColor || defaultSlide.backgroundColor || 'from-blue-50 via-blue-100 to-cyan-50',
              gradientColor1: image.gradientColor1 || null,
              gradientColor2: image.gradientColor2 || null,
              gradientColor3: image.gradientColor3 || null,
              headerColor: image.headerColor || defaultSlide.headerColor || '#1f2937',
              isActive: image.isActive !== false,
              displayOrder: image.displayOrder || index + 1,
              sparkleEffectEnabled: image.sparkle_effect_enabled !== false,
              sparkleColor: image.sparkle_color || '#ffffff',
              sparkleSpeed: image.sparkle_speed || 15,
              cardBackgroundColor: image.card_background_color || null,
              cardBackgroundGradient: image.card_background_gradient || null,
              imageInnerBackground: image.image_inner_background || '#ffffff',
            }));
            
            setSlides(slides);
            return;
          }
        }
        
        // Fallback to default slides if no images found
        const defaultSlides = getDefaultSlides();
        setSlides(defaultSlides);
      } catch (error) {
        // Silently fallback to defaults
        setSlides(getDefaultSlides());
      }
    };

    if (typeof window !== 'undefined') {
      fetchSlides();
    } else {
      setSlides(getDefaultSlides());
    }
  }, []);

  const getDefaultSlides = (): Slide[] => [
    {
      id: 'default-1',
      imageUrl: '/slider/im4.jpg', // Use existing image instead of immm3.jpg
      title: 'Traditional Indian Sarees',
      subtitle: 'Discover the elegance and beauty of handcrafted sarees from the heart of India.',
      titleColor: '#ffffff',
      titleSize: 'text-4xl',
      subtitleColor: '#ffffff',
      subtitleSize: 'text-base',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      backgroundColor: 'from-blue-50 via-blue-100 to-cyan-50',
      headerColor: '#1f2937',
      isActive: true,
      displayOrder: 1,
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  // Update header color when slide changes
  useEffect(() => {
    if (slides.length > 0) {
      const currentSlide = slides[currentIndex];
      if (currentSlide) {
        const headerColor = currentSlide.headerColor || '#1f2937';
        setHeaderColor(headerColor);
      }
    }
  }, [currentIndex, slides, setHeaderColor]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  // Build gradient background from 3 colors or use fallback
  let bgStyle: React.CSSProperties = {};
  let bgClasses = '';
  
  if (currentSlide.gradientColor1 && currentSlide.gradientColor2 && currentSlide.gradientColor3) {
    // Use 3-color gradient
    bgStyle = {
      background: `linear-gradient(to bottom right, ${currentSlide.gradientColor1}, ${currentSlide.gradientColor2}, ${currentSlide.gradientColor3})`,
    };
  } else if (currentSlide.gradientColor1 && currentSlide.gradientColor2) {
    // Use 2-color gradient if only 2 colors provided
    bgStyle = {
      background: `linear-gradient(to bottom right, ${currentSlide.gradientColor1}, ${currentSlide.gradientColor2})`,
    };
  } else if (currentSlide.backgroundColor) {
    // Fallback to single background color or Tailwind class
    const bgColor = currentSlide.backgroundColor;
    const isRGBGradient = bgColor.startsWith('linear-gradient');
    const isRGBSolid = bgColor.startsWith('rgb(');
    const isHex = bgColor.startsWith('#');
    const isRGB = isRGBGradient || isRGBSolid || isHex;
    
    if (isRGBGradient) {
      bgStyle = { background: bgColor };
    } else if (isRGBSolid || isHex) {
      bgStyle = { backgroundColor: bgColor };
    } else {
      bgClasses = `bg-gradient-to-br ${bgColor}`;
    }
  } else {
    // Default: Deep Teal → Midnight Gradient (Luxury Safe Choice)
    bgStyle = {
      background: `radial-gradient(
        circle at top right,
        #2f6f7a 0%,
        #1f4f5c 35%,
        #0f2f38 70%,
        #0a1f26 100%
      )`,
    };
  }

  // Sparkle Effect Component - Subtle stars/dots (Premium Luxury)
  const SparkleEffect = () => {
    // Default to true if not set (for backward compatibility)
    const isEnabled = currentSlide.sparkleEffectEnabled !== false;
    
    // Get color and speed from slide, with subtle defaults
    const sparkleColor = currentSlide.sparkleColor || 'rgba(255,255,255,0.7)';
    const baseSpeed = currentSlide.sparkleSpeed || 15; // Base speed in seconds
    
    if (!isEnabled) return null;
    
    // Handle both hex and rgba colors
    const getRgba = (color: string, opacity: number) => {
      // If already rgba, extract and use
      if (color.startsWith('rgba')) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
        }
      }
      // If hex, convert
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
      const rgb = hexToRgb(color);
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    };
    
    // Subtle sparkles: fewer, smaller, lower opacity
    const sparkles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 1 + 1, // 1-2px (subtle)
      left: Math.random() * 100, // 0-100%
      top: Math.random() * 100, // 0-100%
      delay: Math.random() * 6, // 0-6s (staggered start)
      duration: (baseSpeed * 0.6) + Math.random() * (baseSpeed * 0.8), // Mix of speeds
      direction: Math.random() > 0.5 ? 'down-right' : 'up-right', // ↘ or ↗
      opacity: 0.5, // Fixed at 0.5 for subtlety
    }));

    return (
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className={`absolute rounded-full ${sparkle.direction === 'down-right' ? 'animate-sparkle-down-right' : 'animate-sparkle-up-right'}`}
            style={{
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
              background: `radial-gradient(circle, ${getRgba(sparkleColor, 0.7)} 0%, ${getRgba(sparkleColor, 0.4)} 50%, transparent 100%)`,
              boxShadow: `0 0 2px ${getRgba(sparkleColor, 0.5)}, 0 0 4px ${getRgba(sparkleColor, 0.3)}`,
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

  return (
    <div className={`relative w-full min-h-[600px] lg:h-[85vh] flex flex-col lg:flex-row ${bgClasses}`} style={bgStyle}>
      {/* Sparkle Effect - Behind text & image, above background gradient (z-[5]) */}
      <SparkleEffect />
      
      {/* Left Side - Typography (60%) */}
      <div className="w-full lg:w-[60%] flex items-center justify-center px-6 md:px-12 lg:px-20 py-12 md:py-16 lg:py-0 relative overflow-hidden z-10">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl w-full text-center lg:text-left"
        >
          <h1 
            className={`${currentSlide.titleSize || 'text-4xl'} md:text-5xl lg:text-6xl xl:text-7xl font-playfair font-bold mb-6 leading-[1.1] drop-shadow-lg`}
            style={{ color: currentSlide.titleColor || '#ffffff' }}
          >
            {currentSlide.title || 'Vinuvisthara'}
          </h1>

          {currentSlide.subtitle && (
            <p 
              className={`${currentSlide.subtitleSize || 'text-lg'} md:text-xl lg:text-2xl font-poppins mb-10 leading-relaxed font-light drop-shadow-md`}
              style={{ color: currentSlide.subtitleColor || '#ffffff' }}
            >
              {currentSlide.subtitle}
            </p>
          )}

          {currentSlide.buttonText && currentSlide.buttonLink && (
            <div className="mb-8">
              <Link
                href={currentSlide.buttonLink}
                className="inline-block px-10 py-4 font-poppins font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
                style={{
                  backgroundColor: currentSlide.buttonBackgroundColor || '#ffffff',
                  color: currentSlide.buttonTextColor || '#000000',
                }}
                onMouseEnter={(e) => {
                  // Slightly darken on hover
                  const bgColor = currentSlide.buttonBackgroundColor || '#ffffff';
                  if (bgColor && bgColor.startsWith('#')) {
                    const hex = bgColor.replace('#', '');
                    if (hex.length === 6) {
                      const r = parseInt(hex.substr(0, 2), 16);
                      const g = parseInt(hex.substr(2, 2), 16);
                      const b = parseInt(hex.substr(4, 2), 16);
                      const newR = Math.max(0, r - 20);
                      const newG = Math.max(0, g - 20);
                      const newB = Math.max(0, b - 20);
                      e.currentTarget.style.backgroundColor = `rgb(${newR}, ${newG}, ${newB})`;
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = currentSlide.buttonBackgroundColor || '#ffffff';
                }}
              >
                {currentSlide.buttonText}
              </Link>
            </div>
          )}

          {/* Navigation Controls */}
          {slides.length > 1 && (
            <div className="flex items-center justify-center lg:justify-start gap-4 mt-8 md:mt-0">
              <button
                onClick={goToPrevious}
                className="hidden md:flex w-10 h-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all duration-300 shadow-md hover:scale-110"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-8 h-2.5 bg-white'
                        : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="hidden md:flex w-10 h-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all duration-300 shadow-md hover:scale-110"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Right Side - Premium Bridal Design (40%) - Soft Gradient Circle + Layered Cards + Gold Accent */}
      <div className="w-full lg:w-[40%] relative overflow-visible bg-transparent flex items-center justify-center py-12 lg:py-0 md:justify-center lg:justify-center mt-8 md:mt-12 lg:mt-0">
        {/* Subtle background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating orbs for depth */}
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 right-10 w-32 h-32 rounded-full opacity-20 blur-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(255, 182, 193, 0.4) 0%, transparent 70%)',
            }}
          />
          <motion.div
            animate={{
              x: [0, -25, 0],
              y: [0, 25, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-20 left-10 w-40 h-40 rounded-full opacity-15 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(255, 218, 185, 0.3) 0%, transparent 70%)',
            }}
          />
        </div>
        
        <div className="relative w-full h-full max-w-lg mx-auto premium-bridal-container group">
          <AnimatePresence mode="wait">
            {(() => {
              // Get main image
              const mainImage = currentSlide.images && currentSlide.images.length > 0 
                ? currentSlide.images.find(img => img.is_primary) || currentSlide.images[0]
                : currentSlide.imageUrl 
                  ? { id: 'main', image_url: currentSlide.imageUrl, order: 0 }
                  : null;
              
              // Get 2 background images for subtle layered cards
              const backgroundImages = currentSlide.images && currentSlide.images.length > 1
                ? currentSlide.images
                    .filter(img => !img.is_primary)
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .slice(0, 2)
                : [];
              
              return (
                <>
                  {/* Background Layered Cards (Very Subtle) */}
                  {backgroundImages.map((bgImage, index) => (
                    <motion.div
                      key={`${currentSlide.id}-bg-${index}-${bgImage.id}`}
                      initial={{ opacity: 0, scale: 0.85, rotate: index === 0 ? -3 : 2 }}
                      animate={{ 
                        opacity: 0.15, 
                        scale: index === 0 ? 0.88 : 0.85,
                        rotate: index === 0 ? -3 : 2,
                      }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ 
                        zIndex: 5 - index,
                        transform: `rotate(${index === 0 ? -3 : 2}deg)`,
                      }}
                    >
                      <div 
                        className={`relative ${index === 0 ? 'w-36 md:w-64 lg:w-72 h-44 md:h-80 lg:h-96' : 'w-32 md:w-60 lg:w-68 h-40 md:h-76 lg:h-92'} rounded-3xl overflow-hidden bg-white/20 backdrop-blur-sm`}
                        style={{
                          filter: 'blur(2px)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        <Image
                          src={bgImage.image_url}
                          alt={`Background ${index + 1}`}
                          fill
                          className="object-cover opacity-30"
                          sizes={index === 0 ? "(max-width: 768px) 144px, 288px" : "(max-width: 768px) 128px, 272px"}
                        />
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Large Blurred Gradient Circle (Spotlight Effect) */}
                  <motion.div
                    key={`${currentSlide.id}-gradient-circle`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ zIndex: 10 }}
                  >
                    <div 
                      className="w-[500px] h-[500px] md:w-[600px] md:h-[600px] rounded-full blur-3xl opacity-60 group-hover:opacity-70 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle, rgba(255, 218, 185, 0.4) 0%, rgba(255, 239, 213, 0.3) 30%, rgba(255, 250, 240, 0.2) 60%, transparent 100%)',
                      }}
                    />
                  </motion.div>
                  
                  {/* Main Image - Luxury Frosted Glass Card with Floating Animation */}
                  {mainImage && (
                    <motion.div
                      key={`${currentSlide.id}-main-${mainImage.id}`}
                      initial={{ opacity: 0, scale: 0.9, y: 20, rotate: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0, rotate: -4 }}
                      exit={{ opacity: 0, scale: 0.9, rotate: -4 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ zIndex: 20 }}
                    >
                      <div 
                        className="relative w-48 md:w-80 lg:w-96 h-[18rem] md:h-[28rem] lg:h-[32rem] rounded-[28px] overflow-hidden backdrop-blur-md p-[14px] transition-all duration-500 animate-float-card ml-4 md:ml-0 mt-8 md:mt-0"
                        style={{
                          background: currentSlide.cardBackgroundGradient 
                            ? currentSlide.cardBackgroundGradient
                            : currentSlide.cardBackgroundColor
                              ? currentSlide.cardBackgroundColor
                              : 'linear-gradient(145deg, rgba(255,255,255,0.85), rgba(230,240,255,0.85))',
                          boxShadow: '0 25px 60px rgba(0,0,0,0.35), 0 0 40px rgba(255, 215, 160, 0.15)',
                        }}
                      >
                        {/* Golden accent glow - top right corner */}
                        <div 
                          className="absolute -top-5 -right-5 w-20 h-20 pointer-events-none"
                          style={{
                            background: 'radial-gradient(circle, rgba(255,200,120,0.5), transparent 70%)',
                            filter: 'blur(8px)',
                          }}
                        />
                        
                        {/* Inner frame with warm image filter */}
                        <div 
                          className="relative w-full h-full rounded-[20px] overflow-hidden transition-colors duration-300"
                          style={{
                            backgroundColor: currentSlide.imageInnerBackground || '#ffffff',
                          }}
                          data-inner-bg={currentSlide.imageInnerBackground || '#ffffff'}
                        >
                          <Image
                            src={mainImage.image_url}
                            alt={currentSlide.title || 'Premium Saree'}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            style={{
                              filter: 'brightness(1.05) contrast(1.05) saturate(1.1)',
                            }}
                            sizes="(max-width: 768px) 160px, (max-width: 1024px) 320px, 384px"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Gold Ethnic Accent - Paisley/Mandala Pattern (Top Right) */}
                  <motion.div
                    key={`${currentSlide.id}-gold-accent`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="absolute top-8 right-8 md:top-12 md:right-12 pointer-events-none z-30"
                    style={{ 
                      filter: 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.3))',
                    }}
                  >
                    <svg 
                      width="120" 
                      height="120" 
                      viewBox="0 0 120 120" 
                      className="transition-all duration-500 group-hover:scale-110 group-hover:opacity-90"
                      style={{
                        filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.4))',
                      }}
                    >
                      <defs>
                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
                          <stop offset="50%" stopColor="#FFA500" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#FFD700" stopOpacity="0.7" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Paisley/Mandala Pattern */}
                      <g fill="url(#goldGradient)" filter="url(#glow)" className="group-hover:opacity-100 transition-opacity">
                        {/* Main paisley shape */}
                        <path d="M60 20 C70 15, 80 20, 85 30 C90 40, 85 50, 80 60 C75 70, 65 75, 60 80 C55 75, 45 70, 40 60 C35 50, 30 40, 35 30 C40 20, 50 15, 60 20 Z" opacity="0.8" />
                        {/* Decorative swirls */}
                        <circle cx="75" cy="35" r="4" opacity="0.7" />
                        <circle cx="45" cy="35" r="4" opacity="0.7" />
                        <path d="M60 25 Q65 30, 60 35 Q55 30, 60 25" strokeWidth="1.5" fill="none" stroke="url(#goldGradient)" opacity="0.6" />
                        <path d="M70 45 Q75 50, 70 55 Q65 50, 70 45" strokeWidth="1.5" fill="none" stroke="url(#goldGradient)" opacity="0.6" />
                        <path d="M50 45 Q45 50, 50 55 Q55 50, 50 45" strokeWidth="1.5" fill="none" stroke="url(#goldGradient)" opacity="0.6" />
                      </g>
                    </svg>
                  </motion.div>
                </>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
