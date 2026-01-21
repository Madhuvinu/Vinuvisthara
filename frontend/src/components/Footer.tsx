'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl md:text-4xl font-playfair font-bold text-white mb-4">
              Vinu Visthara
            </h3>
            <p className="text-xl md:text-2xl font-playfair font-semibold text-white mb-3 italic">
              Drape Confidence. Drape Legacy. Drape Your Story.
            </p>
            <p className="text-gray-300 font-poppins text-base leading-relaxed mb-6">
              Making the magic of the six yards a practical, beautiful, and essential part of every modern wardrobe.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-playfair font-semibold text-lg text-white mb-4">Quick Links</h4>
            <ul className="space-y-3 font-poppins">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-playfair font-semibold text-lg text-white mb-4">Contact Info</h4>
            <ul className="space-y-4 font-poppins">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 text-white" />
                <a 
                  href="tel:9110286807" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  9110286807
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-white" />
                <a 
                  href="mailto:info.vinuvisthara@gmail.com" 
                  className="text-gray-300 hover:text-white transition-colors break-all"
                >
                  info.vinuvisthara@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-300 font-poppins text-sm text-center md:text-left">
              © {currentYear} Vinu Visthara. All rights reserved.
            </p>
            <p className="text-gray-400 font-poppins text-sm text-center md:text-right">
              Founder: Vinutha Madhu
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
