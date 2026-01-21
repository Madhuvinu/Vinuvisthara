'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HeaderColorContextType {
  headerColor: string;
  setHeaderColor: (color: string) => void;
}

const HeaderColorContext = createContext<HeaderColorContextType | undefined>(undefined);

export function HeaderColorProvider({ children }: { children: ReactNode }) {
  const [headerColor, setHeaderColorState] = useState<string>('#1f2937');

  const setHeaderColor = (color: string) => {
    setHeaderColorState(color);
    // Also store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('headerColor', color);
    }
  };

  useEffect(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const savedColor = localStorage.getItem('headerColor');
      if (savedColor) {
        setHeaderColorState(savedColor);
      }
    }
  }, []);

  return (
    <HeaderColorContext.Provider value={{ headerColor, setHeaderColor }}>
      {children}
    </HeaderColorContext.Provider>
  );
}

export function useHeaderColor() {
  const context = useContext(HeaderColorContext);
  if (context === undefined) {
    throw new Error('useHeaderColor must be used within a HeaderColorProvider');
  }
  return context;
}
