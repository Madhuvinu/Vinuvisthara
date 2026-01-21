'use client';

import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ScrollReveal from '@/components/ScrollReveal';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Thank you for subscribing! Check your email for exclusive offers.');
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="py-24 px-4 bg-luxury-charcoal relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center text-white">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-8 border border-white/20">
              <Mail className="w-10 h-10 text-white" />
            </div>
            
            {/* Bold Heading */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-playfair font-bold mb-6 leading-tight">
              Let's Craft
              <br />
              <span className="text-gray-400">Something New</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 font-poppins mb-12 max-w-2xl mx-auto">
              Subscribe to our newsletter and be the first to know about new collections, exclusive offers, and special discounts.
            </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 font-poppins text-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-luxury-gold text-luxury-charcoal font-poppins font-semibold text-lg rounded-lg hover:bg-luxury-gold/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl"
              >
                {isSubmitting ? (
                  'Subscribing...'
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

            <p className="text-sm text-gray-400 font-poppins mt-6">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
