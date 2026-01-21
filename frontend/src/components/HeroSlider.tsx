'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SliderItem {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
}

interface HeroSliderProps {
  slides: SliderItem[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);

  const activeSlides = slides.filter((slide) => slide);

  // Only auto-play if there's more than one slide
  useEffect(() => {
    if (!isAutoPlaying || activeSlides.length <= 1) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, activeSlides.length]);

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  if (activeSlides.length === 0) {
    return null;
  }

  const currentSlide = activeSlides[currentIndex];

  // Variants for fade + zoom animation
  const slideVariants = {
    enter: (direction: number) => ({
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      zIndex: 1,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="relative w-full min-h-[600px] lg:h-[85vh] flex flex-col lg:flex-row">
      {/* Left Side - Typography Section with Purple Gradient Background (EXACTLY like Euphoria) */}
      <div className="w-full lg:w-[60%] bg-gradient-to-r from-purple-300 via-purple-200 to-pink-200 flex items-center justify-center px-6 md:px-12 lg:px-20 py-16 lg:py-0 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 max-w-2xl w-full text-center lg:text-left"
        >
          {/* Main Heading - Large white text */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-playfair font-bold text-white mb-6 leading-[1.1]">
            {currentSlide.title || 'WE ARE THE'}
          </h1>
          
          {/* Subtitle - White text, slightly smaller */}
          {currentSlide.subtitle && (
            <p className="text-xl md:text-2xl lg:text-3xl font-poppins text-white mb-10 leading-relaxed font-light">
              {currentSlide.subtitle}
            </p>
          )}

          {/* CTA Button - White background with black text */}
          <div className="mb-8">
            {currentSlide.buttonText && currentSlide.buttonLink ? (
              <Link
                href={currentSlide.buttonLink}
                className="inline-block px-10 py-4 bg-white text-gray-900 font-poppins font-bold text-lg rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-xl uppercase"
              >
                {currentSlide.buttonText}
              </Link>
            ) : (
              <Link
                href="/products"
                className="inline-block px-10 py-4 bg-white text-gray-900 font-poppins font-bold text-lg rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-xl uppercase"
              >
                Discover
              </Link>
            )}
          </div>

          {/* Slider Navigation Controls - Below button, white arrows and dots */}
          {activeSlides.length > 1 && (
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <button
                onClick={goToPrevious}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all duration-300 shadow-md hover:scale-110"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {/* Dot Indicators */}
              <div className="flex items-center gap-2">
                {activeSlides.map((_, index) => (
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
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all duration-300 shadow-md hover:scale-110"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Right Side - Half-Width Slider (40% width) with rounded corners and shadow */}
      <div className="w-full lg:w-[40%] relative overflow-visible bg-transparent">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              opacity: { duration: 0.6 },
              scale: { duration: 0.6 },
            }}
            className="absolute inset-0 m-6 rounded-3xl overflow-hidden shadow-2xl"
          >
            {currentSlide.imageUrl.startsWith('http') || currentSlide.imageUrl.startsWith('/') ? (
              <Image
                src={currentSlide.imageUrl}
                alt={currentSlide.title || 'Hero Image'}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                style={{ objectFit: 'cover' }}
                unoptimized={currentSlide.imageUrl.startsWith('http://localhost')}
              />
            ) : (
              <Image
                src={currentSlide.imageUrl}
                alt={currentSlide.title || 'Hero Image'}
                fill
                className="object-cover"
                sizes="100vw"
                priority
                unoptimized={currentSlide.imageUrl.startsWith('http://localhost')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
