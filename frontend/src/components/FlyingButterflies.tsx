'use client';

/** Golden butterflies flying inside the Trending Sarees section background */
export default function FlyingButterflies() {
  const butterflies = [
    { x: '12%', y: '18%', size: 24, delay: 0, duration: 8 },
    { x: '88%', y: '22%', size: 20, delay: 1.5, duration: 9 },
    { x: '25%', y: '55%', size: 18, delay: 0.8, duration: 7 },
    { x: '72%', y: '48%', size: 22, delay: 2, duration: 10 },
    { x: '50%', y: '30%', size: 16, delay: 0.3, duration: 8.5 },
    { x: '8%', y: '65%', size: 20, delay: 2.5, duration: 9 },
    { x: '92%', y: '70%', size: 18, delay: 1, duration: 7.5 },
    { x: '40%', y: '78%', size: 14, delay: 1.8, duration: 11 },
    { x: '60%', y: '15%', size: 20, delay: 0.5, duration: 8 },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      aria-hidden
    >
      {butterflies.map((b, i) => (
        <div
          key={i}
          className="butterfly-fly absolute"
          style={{
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-full w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
            fill="none"
          >
            <defs>
              <linearGradient id={`gold-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5d56e" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#d4a13a" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#b8860b" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            {/* Left wing */}
            <ellipse cx="8" cy="12" rx="8" ry="5" fill={`url(#gold-${i})`} transform="rotate(-20 8 12)" />
            {/* Right wing */}
            <ellipse cx="16" cy="12" rx="8" ry="5" fill={`url(#gold-${i})`} transform="rotate(20 16 12)" />
            {/* Body */}
            <ellipse cx="12" cy="12" rx="1.2" ry="6" fill="#8b6914" opacity="0.8" />
          </svg>
        </div>
      ))}
    </div>
  );
}
