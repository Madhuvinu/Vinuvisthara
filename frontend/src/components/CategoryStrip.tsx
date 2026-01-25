'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Category {
  id: number | string;
  name: string;
  slug: string;
  image?: string | null;
  order?: number;
  is_active?: boolean;
}

export default function CategoryStrip() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        const list = Array.isArray(data)
          ? data
          : (data && (data as { categories?: Category[] }).categories) || [];
        const sorted = [...list]
          .filter((c: Category) => c.is_active !== false)
          .sort((a: Category, b: Category) => (a.order ?? 0) - (b.order ?? 0));
        setCategories(sorted.slice(0, 3));
      } catch (e) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 px-3 sm:grid-cols-3 sm:gap-5 sm:px-0 md:gap-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[96px] sm:h-[160px] animate-pulse rounded-md sm:rounded-xl bg-gray-300"
          />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-2 px-3 sm:grid-cols-3 sm:gap-5 sm:px-0 md:gap-8">
      {categories.map((cat) => (
        <Link
          key={String(cat.id)}
          href={`/collections/${cat.slug}`}
          className="category-card group relative block overflow-hidden rounded-md sm:rounded-xl border border-[#c9a24d] shadow-[0_0_0_1px_rgba(201,162,77,0.35)] transition-transform duration-300 ease-out sm:hover:-translate-y-1"
        >
          <div
            className="relative h-[96px] sm:h-[160px] overflow-hidden rounded-md sm:rounded-xl bg-gray-400"
            style={{
              backgroundImage: cat.image ? `url(${cat.image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)',
              }}
            />
            <h3 className="absolute bottom-1 left-1 sm:bottom-4 sm:left-4 text-[11px] sm:text-[22px] font-semibold text-white leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
              {cat.name}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
