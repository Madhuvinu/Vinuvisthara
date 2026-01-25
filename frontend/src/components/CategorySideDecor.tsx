'use client';

export default function CategorySideDecor() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4">
      {/* Quality symbol - star */}
      <div className="decor-quality-badge flex flex-col items-center opacity-80">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8 text-[#8b7355]">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span className="text-[9px] sm:text-[10px] font-medium text-[#6b5d4f] mt-0.5 uppercase tracking-wider">Quality</span>
      </div>

      {/* Mountain flow - wavy SVG */}
      <div className="decor-mountain-flow">
        <svg viewBox="0 0 80 40" className="w-14 h-7 sm:w-16 sm:h-8 text-[#a08a75]/50" preserveAspectRatio="none">
          <path fill="currentColor" d="M0 40 Q20 20 40 30 T80 20 V40 H0 Z" />
          <path fill="currentColor" opacity="0.6" d="M0 40 Q15 25 35 32 T70 25 V40 H0 Z" />
          <path fill="currentColor" opacity="0.3" d="M0 40 Q25 28 50 35 T80 28 V40 H0 Z" />
        </svg>
      </div>

      {/* Flowers */}
      <div className="decor-flowers flex gap-1.5 sm:gap-2">
        <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-[#c4a77d]/60 decor-flower" fill="currentColor">
          <path d="M12 22c-4.97 0-9-2.58-9-6 0-1.82 1.12-3.45 2.9-4.6-.52 1.55-.4 2.96.3 4.05.7 1.09 1.9 1.7 2.8 1.7 1 0 2-.61 2.8-1.7.7-1.09.82-2.5.3-4.05C19.88 12.55 21 14.18 21 16c0 3.42-4.03 6-9 6z" />
          <circle cx="12" cy="8" r="3.5" />
        </svg>
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a08a75]/50 decor-flower decor-flower-2" fill="currentColor">
          <path d="M12 22c-4.97 0-9-2.58-9-6 0-1.82 1.12-3.45 2.9-4.6-.52 1.55-.4 2.96.3 4.05.7 1.09 1.9 1.7 2.8 1.7 1 0 2-.61 2.8-1.7.7-1.09.82-2.5.3-4.05C19.88 12.55 21 14.18 21 16c0 3.42-4.03 6-9 6z" />
          <circle cx="12" cy="8" r="3.5" />
        </svg>
        <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-[#c4a77d]/60 decor-flower decor-flower-3" fill="currentColor">
          <path d="M12 22c-4.97 0-9-2.58-9-6 0-1.82 1.12-3.45 2.9-4.6-.52 1.55-.4 2.96.3 4.05.7 1.09 1.9 1.7 2.8 1.7 1 0 2-.61 2.8-1.7.7-1.09.82-2.5.3-4.05C19.88 12.55 21 14.18 21 16c0 3.42-4.03 6-9 6z" />
          <circle cx="12" cy="8" r="3.5" />
        </svg>
      </div>

      {/* Best product text */}
      <div className="text-center">
        <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[#8b7355]/90 font-medium">Best</span>
        <br />
        <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-[#6b5d4f]/80 font-medium">Product</span>
      </div>
    </div>
  );
}

export function CategorySideDecorRight() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4">
      {/* Quality symbol - award star */}
      <div className="decor-quality-badge flex flex-col items-center opacity-80">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8 text-[#8b7355]">
          <path d="M12 2l2.4 4.85 5.35.78-3.87 3.77.91 5.32L12 14.27l-4.19 2.19.91-5.32-3.87-3.77 5.35-.78L12 2z" />
        </svg>
        <span className="text-[9px] sm:text-[10px] font-medium text-[#6b5d4f] mt-0.5 uppercase tracking-wider">Premium</span>
      </div>

      {/* Mountain flow - mirrored */}
      <div className="decor-mountain-flow scale-x-[-1]">
        <svg viewBox="0 0 80 40" className="w-14 h-7 sm:w-16 sm:h-8 text-[#a08a75]/50" preserveAspectRatio="none">
          <path fill="currentColor" d="M0 40 Q20 20 40 30 T80 20 V40 H0 Z" />
          <path fill="currentColor" opacity="0.6" d="M0 40 Q15 25 35 32 T70 25 V40 H0 Z" />
          <path fill="currentColor" opacity="0.3" d="M0 40 Q25 28 50 35 T80 28 V40 H0 Z" />
        </svg>
      </div>

      {/* Flowers */}
      <div className="decor-flowers flex gap-1.5 sm:gap-2">
        <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-[#c4a77d]/60 decor-flower decor-flower-3" fill="currentColor">
          <path d="M12 22c-4.97 0-9-2.58-9-6 0-1.82 1.12-3.45 2.9-4.6-.52 1.55-.4 2.96.3 4.05.7 1.09 1.9 1.7 2.8 1.7 1 0 2-.61 2.8-1.7.7-1.09.82-2.5.3-4.05C19.88 12.55 21 14.18 21 16c0 3.42-4.03 6-9 6z" />
          <circle cx="12" cy="8" r="3.5" />
        </svg>
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a08a75]/50 decor-flower decor-flower-2" fill="currentColor">
          <path d="M12 22c-4.97 0-9-2.58-9-6 0-1.82 1.12-3.45 2.9-4.6-.52 1.55-.4 2.96.3 4.05.7 1.09 1.9 1.7 2.8 1.7 1 0 2-.61 2.8-1.7.7-1.09.82-2.5.3-4.05C19.88 12.55 21 14.18 21 16c0 3.42-4.03 6-9 6z" />
          <circle cx="12" cy="8" r="3.5" />
        </svg>
        <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-[#c4a77d]/60 decor-flower" fill="currentColor">
          <path d="M12 22c-4.97 0-9-2.58-9-6 0-1.82 1.12-3.45 2.9-4.6-.52 1.55-.4 2.96.3 4.05.7 1.09 1.9 1.7 2.8 1.7 1 0 2-.61 2.8-1.7.7-1.09.82-2.5.3-4.05C19.88 12.55 21 14.18 21 16c0 3.42-4.03 6-9 6z" />
          <circle cx="12" cy="8" r="3.5" />
        </svg>
      </div>

      <div className="text-center">
        <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[#8b7355]/90 font-medium">Best</span>
        <br />
        <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-[#6b5d4f]/80 font-medium">Product</span>
      </div>
    </div>
  );
}
