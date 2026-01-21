'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'Absolutely stunning sarees! The quality exceeded my expectations. The silk saree I ordered is so elegant and the delivery was super fast. Highly recommended!',
    image: '👩‍💼',
  },
  {
    id: 2,
    name: 'Anjali Patel',
    location: 'Delhi',
    rating: 5,
    text: 'I\'ve ordered multiple sarees from Vinuvisthara and each one has been perfect. The collection is amazing and the customer service is excellent. Will definitely shop again!',
    image: '👩',
  },
  {
    id: 3,
    name: 'Meera Reddy',
    location: 'Bangalore',
    rating: 5,
    text: 'The bridal collection is breathtaking! I found the perfect saree for my wedding. The attention to detail and craftsmanship is outstanding. Thank you Vinuvisthara!',
    image: '👰',
  },
  {
    id: 4,
    name: 'Kavita Singh',
    location: 'Pune',
    rating: 5,
    text: 'Love the contemporary designs! Great quality fabric and beautiful colors. The packaging was also very elegant. Very satisfied with my purchase.',
    image: '💃',
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* Bold Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="mb-20 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500 font-poppins font-semibold mb-4">
              The heroes of our story
            </p>
            <h2 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-playfair font-bold text-gray-900 leading-[0.9]">
              What Our
              <br />
              <span className="text-gray-400">Customers Say</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Testimonial Card */}
        <ScrollReveal direction="fade" delay={200}>
          <div className="max-w-5xl mx-auto relative">
            <div className="bg-luxury-cream rounded-3xl p-12 md:p-16 relative overflow-hidden border border-gray-100">
              {/* Quote Icon */}
              <div className="absolute top-8 left-8 opacity-10">
                <Quote className="w-32 h-32 text-gray-900" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-center mb-8">
                  <div className="text-7xl">{currentTestimonial.image}</div>
                </div>
                
                <div className="flex justify-center mb-6">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 fill-luxury-gold text-luxury-gold" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-2xl md:text-3xl lg:text-4xl font-playfair text-gray-900 text-center mb-10 leading-relaxed">
                  "{currentTestimonial.text}"
                </blockquote>

                <div className="text-center">
                  <p className="font-poppins font-bold text-gray-900 text-xl mb-1">
                    {currentTestimonial.name}
                  </p>
                  <p className="font-poppins text-gray-500 text-sm uppercase tracking-wider">
                    {currentTestimonial.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-6 mt-12">
              <button
                onClick={goToPrevious}
                className="w-14 h-14 rounded-full bg-luxury-charcoal text-white hover:bg-luxury-gold transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-110"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex gap-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'w-12 bg-luxury-charcoal' 
                        : 'w-3 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="w-14 h-14 rounded-full bg-luxury-charcoal text-white hover:bg-luxury-gold transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-110"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
