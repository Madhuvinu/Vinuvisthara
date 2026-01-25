'use client';

import { motion } from 'framer-motion';
import { Sparkles, Heart, Target, Award, Users, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const faqs = [
    {
      question: "Are Vinu Visthara sarees handloom products?",
      answer: "No. While we deeply respect the handloom tradition, Vinu Visthara specializes in high-quality, manufactured sarees. We partner with advanced textile units to ensure our products have consistent quality, flawless finish, and exceptional durability at an accessible price point, focusing on modern convenience."
    },
    {
      question: "What materials are your sarees made from?",
      answer: "Our sarees are crafted from premium materials including georgettes, chiffon, manufactured silks, and other contemporary fabrics. Each material is carefully selected for its quality, durability, and comfort."
    },
    {
      question: "Are your sarees suitable for all age groups?",
      answer: "Absolutely! Our collection is designed for every generation - from teens to seniors. We offer lightweight contemporary options for younger wearers, versatile designs for professionals, and elegant traditional pieces for mature customers."
    },
    {
      question: "What is the standard length of a Vinu Visthara saree?",
      answer: "Our sarees come in standard lengths suitable for all body types, typically ranging from 5.5 to 6 meters, ensuring comfortable draping for everyone."
    },
    {
      question: "What are the general care instructions for your sarees?",
      answer: "Most of our sarees can be gently hand-washed or dry-cleaned depending on the fabric. We recommend following the care label instructions provided with each saree. Store them in a cool, dry place, preferably wrapped in muslin cloth to maintain their quality and color."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={isVisible ? { scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-amber-600" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-bold text-gray-900 mb-4">
              About Vinu Visthara
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 font-poppins italic">
              Where Style Meets Confidence
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate={isVisible ? "animate" : "initial"}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-10 md:p-12 mb-12 border border-amber-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-amber-600" />
                <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-gray-900">
                  The Heart of Vinu Visthara
                </h2>
              </div>
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6 font-poppins">
                At Vinu Visthara, we believe that true style is more than just clothing, it's a vibrant expression of your inner strength and state of mind. Our brand is a celebration of the modern individual, built on the foundational idea that <span className="font-semibold text-amber-700">style meets confidence</span>.
              </p>
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6 font-poppins">
                We curate collections that empower you to step into any room feeling authentic and unstoppable. We understand that stepping into your personal style is a journey, and our meticulously selected range from timeless elegance to contemporary trends is designed to be your trusted partner. Every piece is chosen not only to enhance your look but also to instill a profound sense of self-assuredness.
              </p>
              <div className="bg-gradient-to-r from-amber-50 to-purple-50 rounded-lg p-6 border-l-4 border-amber-600">
                <p className="text-xl sm:text-2xl font-playfair font-semibold text-gray-900 italic text-center">
                  "Our mission is to ensure that what you wear is a reflection of unshakeable confidence. When you wear Vinu Visthara, you don't just dress for the occasion, you dress to own it."
                </p>
              </div>
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mt-6 font-poppins font-semibold text-center">
                Vinu Visthara is not just about wearing clothes; it's about wearing your confidence.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Saree for Every Age Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-amber-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-4">
              Saree for Every Age, Every Story
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-poppins">
              We are dedicated to shattering the myth that sarees are reserved only for grandmothers or formal events. Our curation process is focused on universal appeal and multi-generational versatility.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "The Bold Beginners",
                subtitle: "Teens & 20s",
                description: "Lightweight, contemporary fabrics (georgettes, chiffon, manufactured silks) in modern prints and pastel colors that are easy to drape and manage for college, casual events, and parties.",
                color: "from-pink-100 to-purple-100",
                icon: "🌸"
              },
              {
                title: "The Modern Curators",
                subtitle: "30s & 40s",
                description: "The perfect blend of traditional and trendy. Richer finishes, classic color palettes, and versatile designs that transition seamlessly from professional wear to festive occasions.",
                color: "from-purple-100 to-amber-100",
                icon: "✨"
              },
              {
                title: "The Heritage Holders",
                subtitle: "50s +",
                description: "Elegant, dignified fabrics with established patterns and comfortable drapes. Our focus here is on sophistication, quality finish, and classic appeal that respects tradition.",
                color: "from-amber-100 to-orange-100",
                icon: "👑"
              }
            ].map((ageGroup, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`bg-gradient-to-br ${ageGroup.color} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/50`}
              >
                <div className="text-5xl mb-4">{ageGroup.icon}</div>
                <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">
                  {ageGroup.title}
                </h3>
                <p className="text-amber-700 font-semibold mb-4 font-poppins">
                  {ageGroup.subtitle}
                </p>
                <p className="text-gray-700 leading-relaxed font-poppins">
                  {ageGroup.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Target className="w-8 h-8 text-amber-600" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-gray-900">
                Our Vision for the Future
              </h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Award,
                title: "Premium Quality",
                description: "Manufactured excellence with flawless finish, uniform thread count, and consistent color vibrancy that often surpasses traditional methods.",
                color: "text-amber-600"
              },
              {
                icon: Target,
                title: "Accessible Pricing",
                description: "Premium aesthetics without the premium price tag. From budget-friendly daily wear to statement pieces for life's most cherished moments.",
                color: "text-purple-600"
              },
              {
                icon: Users,
                title: "For Every Age",
                description: "Our collection offers everything for the entire family, making Vinu Visthara the go-to brand for all generations.",
                color: "text-pink-600"
              }
            ].map((vision, index) => {
              const IconComponent = vision.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-amber-100"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-50 to-purple-50 mb-6 ${vision.color}`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-4">
                    {vision.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed font-poppins">
                    {vision.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-amber-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-amber-600"
              >
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl sm:text-2xl font-playfair font-bold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 leading-relaxed font-poppins">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center bg-gradient-to-br from-amber-100 via-purple-50 to-pink-100 rounded-3xl p-12 sm:p-16 shadow-2xl border border-amber-200"
          >
            <Sparkles className="w-16 h-16 text-amber-600 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-6">
              Join the Vinu Visthara Family
            </h2>
            <p className="text-xl text-gray-700 mb-8 font-poppins">
              Discover your perfect saree and embrace your confidence today.
            </p>
            <motion.a
              href="/collections/all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-gradient-to-r from-amber-600 to-purple-600 text-white font-poppins font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Shop Now
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
