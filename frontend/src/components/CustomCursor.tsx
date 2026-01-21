'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';

type CursorState = 'default' | 'product' | 'button' | 'link';

export default function CustomCursor() {
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [cursorData, setCursorData] = useState<{ text?: string }>({});
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 20, stiffness: 500 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Set up hover listeners for product cards
    const setupHoverListeners = () => {
      const productCards = document.querySelectorAll('[data-cursor="product"]');
      const buttons = document.querySelectorAll('button, a[href]');

      productCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          setCursorState('product');
          setCursorData({ text: 'View Product' });
        });
        card.addEventListener('mouseleave', () => {
          setCursorState('default');
          setCursorData({});
        });
      });

      buttons.forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          if (!btn.hasAttribute('data-cursor')) {
            setCursorState('button');
          }
        });
        btn.addEventListener('mouseleave', () => {
          if (!btn.hasAttribute('data-cursor')) {
            setCursorState('default');
          }
        });
      });
    };

    window.addEventListener('mousemove', updateCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    setupHoverListeners();

    // Re-setup listeners when DOM changes
    const observer = new MutationObserver(setupHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Default Cursor - Small white dot */}
      {cursorState === 'default' && isVisible && (
        <motion.div
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
          }}
          className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        >
          <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
        </motion.div>
      )}

      {/* Product Cursor - Pill with text and icon */}
      {cursorState === 'product' && isVisible && (
        <motion.div
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
          }}
          className="fixed top-0 left-0 pointer-events-none z-[9999]"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-white/30"
          >
            <span className="text-sm font-poppins font-semibold text-gray-900 whitespace-nowrap">
              {cursorData.text || 'View Product'}
            </span>
            <ShoppingCart className="w-4 h-4 text-gray-900" />
          </motion.div>
        </motion.div>
      )}

      {/* Button/Link Cursor - Slightly larger dot */}
      {(cursorState === 'button' || cursorState === 'link') && isVisible && (
        <motion.div
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
          }}
          className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        >
          <div className="w-3 h-3 bg-white rounded-full shadow-lg" />
        </motion.div>
      )}
    </>
  );
}
