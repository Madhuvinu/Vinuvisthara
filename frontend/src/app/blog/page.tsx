'use client';

import Link from 'next/link';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#faf5eb] py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#3b2f2a] mb-4">
          Blog
        </h1>
        <p className="text-gray-600 mb-8">
          Our blog is coming soon. Stay tuned for style tips, saree care, and more.
        </p>
        <Link
          href="/collections/all"
          className="inline-block px-6 py-3 rounded-xl font-semibold text-white transition-colors"
          style={{
            background: 'linear-gradient(135deg, #d4a574 0%, #8b7355 50%, #6b5d4f 100%)',
          }}
        >
          Explore Collection
        </Link>
      </div>
    </div>
  );
}
