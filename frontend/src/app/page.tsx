import Image from 'next/image';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import TrendingSarees from '@/components/TrendingSarees';
import FlyingButterflies from '@/components/FlyingButterflies';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  return (
    <>
      <HeroSlider />

      {/* Trending Sarees: ttt.png background – pulls up to cover gap, touch category section */}
      <section className="relative w-full -mt-8 sm:-mt-12 md:-mt-14 py-12 sm:py-16 md:py-20 overflow-hidden">
        {/* Full-width background: ttt.png (golden bokeh / luxury Indian decor) */}
        <div className="absolute inset-0">
          <Image
            src="/ttt.png"
            alt="Luxury Indian decor background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>

        {/* Lighter overlay so background shows + subtle warm glow effect */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(250,245,235,0.55) 0%, rgba(250,245,235,0.65) 50%, rgba(250,245,235,0.6) 100%), radial-gradient(ellipse 100% 80% at 50% 20%, rgba(255,220,180,0.12) 0%, transparent 50%)',
          }}
        />

        {/* Flying golden butterflies inside background */}
        <FlyingButterflies />

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8">
          {/* Section Title - Centered with decorative lines */}
          <div className="mb-8 sm:mb-10 md:mb-12 flex flex-col items-center">
            <div className="flex w-full max-w-3xl items-center gap-4 md:gap-6 px-4">
              {/* Decorative line left */}
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b7355] to-[#8b7355] relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#8b7355]" />
              </div>

              {/* Title */}
              <h2 className="shrink-0 font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-[#3b2f2a] text-center">
                Trending Sarees
              </h2>

              {/* Decorative line right */}
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#8b7355] to-[#8b7355] relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#8b7355]" />
              </div>
            </div>
          </div>

          {/* Product Cards Container - Subtle off-white container */}
          <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-white/50 max-w-6xl mx-auto">
            <TrendingSarees />

            {/* Shop Now Button - Centered below cards */}
            <div className="mt-8 sm:mt-10 md:mt-12 flex justify-center">
              <Link
                href="/collections/all"
                className="group relative inline-flex items-center justify-center px-8 py-3 md:px-10 md:py-4 rounded-xl font-semibold text-base md:text-lg text-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #d4a574 0%, #8b7355 50%, #6b5d4f 100%)',
                  boxShadow: '0 4px 15px rgba(139, 115, 85, 0.4)',
                }}
              >
                <span className="relative z-10">Shop Now</span>
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #e4b584 0%, #9b8365 50%, #7b6d5f 100%)',
                  }}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
