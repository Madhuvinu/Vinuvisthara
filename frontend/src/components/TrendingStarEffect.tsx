'use client';

import React from 'react';

const StarSvg = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export function TrendingStarEffect() {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 6 + 4,
    delay: Math.random() * 3,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
        .star-twinkle {
          animation: twinkle var(--duration)s ease-in-out var(--delay)s infinite;
        }
      `}</style>
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute star-twinkle text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              '--duration': `${star.duration}s`,
              '--delay': `${star.delay}s`,
            } as React.CSSProperties}
          >
            <StarSvg />
          </div>
        ))}
      </div>
    </>
  );
}
