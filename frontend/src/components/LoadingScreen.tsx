'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a minimum display time of 2 seconds for the loading screen
    const minimumLoadTime = 2000; // 2 seconds
    let loadStartTime = Date.now();

    const hideLoadingScreen = () => {
      const elapsed = Date.now() - loadStartTime;
      const remainingTime = Math.max(0, minimumLoadTime - elapsed);
      
      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    };

    // Hide loading screen once the page has fully loaded
    if (document.readyState === 'complete') {
      hideLoadingScreen();
    } else {
      window.addEventListener('load', hideLoadingScreen);
      return () => window.removeEventListener('load', hideLoadingScreen);
    }
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Cinematic gradient base */}
      <div
        className="absolute inset-0 opacity-95"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.18), transparent 40%), linear-gradient(135deg, #030303 0%, #050505 45%, #0f172a 100%)',
        }}
      />

      {/* Slow-moving aurora layer */}
      <div className="absolute inset-0 pointer-events-none" style={{ animation: 'auroraShift 18s linear infinite', background: 'conic-gradient(from 90deg, rgba(0,255,184,0.08), transparent, rgba(59,130,246,0.12), transparent)' }} />

      {/* Floating orbs */}
      <div className="absolute -top-20 left-0 w-64 h-64 bg-emerald-500/20 blur-3xl" style={{ animation: 'floaty 12s ease-in-out infinite alternate' }} />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/10 blur-3xl" style={{ animation: 'floaty 14s ease-in-out infinite alternate-reverse' }} />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Theta loader */}
        <div className="relative flex items-center justify-center">
          <div className="theta-core" />
          <div className="theta-core theta-core--halo" />
          <div className="theta-ring theta-ring--outer" />
          <div className="theta-ring theta-ring--mid" />
          <div className="theta-ring theta-ring--inner" />
          <div className="theta-arc theta-arc--left" />
          <div className="theta-arc theta-arc--right" />
          <Image
            src="/otherlogo-Photoroom.png"
            alt="VinuVisthara"
            width={56}
            height={56}
            className="sari-spin"
            priority
          />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold tracking-[0.25em] text-emerald-100 uppercase">VinuVisthara</h2>
          <p className="text-sm tracking-[0.35em] text-emerald-300/80 uppercase">threading elegance</p>
        </div>

        {/* Theta pulse bar */}
        <div className="theta-bar">
          <div className="theta-bar__glow" />
        </div>

        {/* Animated dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block h-2 w-2 rounded-full bg-emerald-400"
              style={{ animation: `bounce 1.2s infinite ${i * 0.12}s` }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .theta-core {
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(167, 243, 208, 0.22) 0%, rgba(6, 95, 70, 0) 65%);
          filter: blur(6px);
        }
        .theta-core--halo {
          width: 90px;
          height: 90px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.25), rgba(23, 23, 23, 0));
          animation: haloPulse 4s ease-in-out infinite;
        }
        .theta-ring {
          position: absolute;
          border-radius: 9999px;
          border: 1px solid rgba(94, 234, 212, 0.4);
          animation: orbit 8s linear infinite;
        }
        .theta-ring--outer {
          width: 160px;
          height: 160px;
          border-color: rgba(6, 182, 212, 0.3);
        }
        .theta-ring--mid {
          width: 135px;
          height: 135px;
          border-color: rgba(110, 231, 183, 0.35);
          animation-duration: 11s;
        }
        .theta-ring--inner {
          width: 110px;
          height: 110px;
          border-color: rgba(16, 185, 129, 0.5);
          animation-duration: 5s;
          animation-direction: reverse;
        }
        .theta-arc {
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 9999px;
          border: 1px solid transparent;
          border-top-color: rgba(6, 182, 212, 0.35);
          border-bottom-color: rgba(59, 130, 246, 0.15);
          opacity: 0.7;
          mix-blend-mode: screen;
        }
        .theta-arc--left {
          transform: rotate(25deg);
          animation: arcSweep 6s linear infinite;
        }
        .theta-arc--right {
          transform: rotate(-25deg);
          animation: arcSweep 7.5s linear infinite reverse;
        }
        .sari-spin {
          position: absolute;
          width: 56px;
          height: 56px;
          animation: sariOrbit 4s linear infinite;
          filter: brightness(0.5) contrast(1.4) saturate(0.95) drop-shadow(0 0 20px rgba(16, 185, 129, 0.9));
          object-fit: contain;
        }
        .theta-bar {
          position: relative;
          width: 200px;
          height: 4px;
          border-radius: 9999px;
          background: rgba(16, 185, 129, 0.2);
          overflow: hidden;
        }
        .theta-bar__glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.8), transparent);
          animation: sweep 1.8s ease-in-out infinite;
        }
        @keyframes haloPulse {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }
        @keyframes sariOrbit {
          from {
            transform: rotate(0deg) translateY(-4px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateY(-4px) rotate(-360deg);
          }
        }
        @keyframes arcSweep {
          0% {
            opacity: 0.2;
            transform: rotate(0deg) scale(0.96);
          }
          50% {
            opacity: 0.7;
            transform: rotate(8deg) scale(1);
          }
          100% {
            opacity: 0.2;
            transform: rotate(16deg) scale(0.96);
          }
        }
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sweep {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(10%); }
          100% { transform: translateX(120%); }
        }
        @keyframes auroraShift {
          0% { transform: translateX(-20%) rotate(0deg); opacity: 0.35; }
          50% { transform: translateX(10%) rotate(180deg); opacity: 0.6; }
          100% { transform: translateX(-20%) rotate(360deg); opacity: 0.35; }
        }
        @keyframes floaty {
          from { transform: translateY(0); }
          to { transform: translateY(-40px); }
        }
      `}</style>
    </div>
  );
}
