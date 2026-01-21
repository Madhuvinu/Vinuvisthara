'use client';

import { Award, Truck, Shield, Heart, Sparkles } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import RollingText from '@/components/RollingText';

const features = [
  {
    icon: Award,
    title: 'Premium Quality',
    subtitle: 'Excellence in Every Thread',
    description: 'Handpicked sarees from the finest artisans, ensuring exceptional quality and craftsmanship that stands the test of time.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    subtitle: 'Swift & Secure',
    description: 'Quick and secure shipping across India. Express delivery available for urgent orders. Your elegance, delivered fast.',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    subtitle: '100% Protected',
    description: 'Industry-leading security for all transactions. Shop with confidence knowing your payments are completely secure.',
  },
  {
    icon: Heart,
    title: 'Customer First',
    subtitle: 'Your Satisfaction Matters',
    description: 'Dedicated customer support team. Easy returns and exchanges within 7 days. We care about your experience.',
  },
];

interface WhyChooseSectionProps {
  scrollY?: number;
}

export default function WhyChooseSection({ scrollY = 0 }: WhyChooseSectionProps) {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-purple-50/30 to-pink-50/30 relative overflow-hidden">
      {/* Rolling text effect at top */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden h-16 bg-luxury-charcoal z-10">
        <RollingText 
          text=" ✦ Quality Assurance ✦ Fast Delivery ✦ Secure Payment ✦ Customer First ✦ "
          speed={35}
          direction="right"
          className="text-luxury-gold font-playfair font-bold text-2xl py-4"
        />
      </div>
      
      {/* Background image effect */}
      <div 
        className="absolute inset-0 opacity-[0.02] pt-16"
        style={{
          backgroundImage: "url('/slider/img11.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      ></div>
      
      <div className="container mx-auto max-w-7xl relative z-10 pt-20">
        {/* Bold Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="mb-20 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500 font-poppins font-semibold mb-4">
              Here's all that we do damn well
            </p>
            <h2 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-playfair font-bold text-gray-900 leading-[0.9]">
              Why Choose
              <br />
              <span className="text-gray-400">Vinuvisthara?</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={index} direction="up" delay={index * 150}>
                <div className="group relative bg-white p-10 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-luxury-charcoal rounded-2xl flex items-center justify-center group-hover:bg-luxury-gold transition-colors duration-300">
                      <Icon className="w-10 h-10 text-white group-hover:text-luxury-charcoal transition-colors" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-poppins font-semibold mb-1">
                        {feature.subtitle}
                      </p>
                      <h3 className="text-3xl font-playfair font-bold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 font-poppins leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                {/* Hover Arrow */}
                <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
