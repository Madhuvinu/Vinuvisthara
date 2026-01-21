'use client';

import { useEffect, useState } from 'react';

export default function ScrollingLines() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Horizontal scrolling lines */}
      <div 
        className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          transform: `translateX(${scrollY * 0.5}px)`,
        }}
      />
      <div 
        className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        style={{
          transform: `translateX(${-scrollY * 0.3}px)`,
        }}
      />
      <div 
        className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        style={{
          transform: `translateX(${scrollY * 0.4}px)`,
        }}
      />
      <div 
        className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        style={{
          transform: `translateX(${-scrollY * 0.2}px)`,
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          transform: `translateX(${scrollY * 0.6}px)`,
        }}
      />

      {/* Vertical scrolling lines */}
      <div 
        className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />
      <div 
        className="absolute top-0 left-1/4 h-full w-px bg-gradient-to-b from-transparent via-white/8 to-transparent"
        style={{
          transform: `translateY(${-scrollY * 0.2}px)`,
        }}
      />
      <div 
        className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-white/12 to-transparent"
        style={{
          transform: `translateY(${scrollY * 0.4}px)`,
        }}
      />
      <div 
        className="absolute top-0 left-3/4 h-full w-px bg-gradient-to-b from-transparent via-white/8 to-transparent"
        style={{
          transform: `translateY(${-scrollY * 0.25}px)`,
        }}
      />
      <div 
        className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"
        style={{
          transform: `translateY(${scrollY * 0.35}px)`,
        }}
      />
    </div>
  );
}
