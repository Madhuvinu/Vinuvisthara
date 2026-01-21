'use client';

interface RollingTextProps {
  text: string;
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
}

export default function RollingText({ 
  text, 
  speed = 20, 
  direction = 'left',
  className = '' 
}: RollingTextProps) {
  // Duplicate text for seamless loop
  const duplicatedText = `${text} ${text} ${text}`;

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div 
        className={`inline-block ${direction === 'left' ? 'rolling-text-left' : 'rolling-text-right'}`}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {duplicatedText}
      </div>
    </div>
  );
}
