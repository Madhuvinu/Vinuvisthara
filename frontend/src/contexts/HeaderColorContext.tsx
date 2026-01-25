'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';

interface SparkleSettings {
  enabled: boolean;
  color: string;
  speed: number;
}

interface HeaderColorContextType {
  headerColor: string;
  setHeaderColor: (color: string) => void;
  sparkleSettings: SparkleSettings;
  setSparkleSettings: (settings: SparkleSettings) => void;
}

const HeaderColorContext = createContext<HeaderColorContextType | undefined>(undefined);

export function HeaderColorProvider({ children }: { children: ReactNode }) {
  // Start with context default; slider 1 will override on fetch (fixes green header on /products, etc.)
  const [headerColor, setHeaderColorState] = useState<string>('#1f2937');
  const [sparkleSettings, setSparkleSettingsState] = useState<SparkleSettings>({
    enabled: false,
    color: '#ffffff',
    speed: 15,
  });

  const setHeaderColor = useCallback((color: string) => {
    setHeaderColorState(color);
  }, []);

  const setSparkleSettings = useCallback((settings: SparkleSettings) => {
    setSparkleSettingsState(settings);
  }, []);

  // Fetch slider 1 on mount and use its header_color + sparkle so header matches slider everywhere
  // (e.g. /products/2). HeroSlider still overrides when on home for active slide.
  useEffect(() => {
    let cancelled = false;
    const applySlider1 = async () => {
      try {
        const data = await api.getSliders();
        const list = Array.isArray(data) ? data : [];
        const slider1 = list[0];
        if (cancelled || !slider1) return;
        if (slider1.header_color && String(slider1.header_color).trim() !== '') {
          setHeaderColorState(slider1.header_color);
        }
        setSparkleSettingsState({
          enabled: slider1.sparkle_effect_enabled !== false,
          color: slider1.sparkle_color || '#ffffff',
          speed: Number(slider1.sparkle_speed) || 15,
        });
      } catch {
        // keep defaults
      }
    };
    applySlider1();
    return () => { cancelled = true; };
  }, []);

  return (
    <HeaderColorContext.Provider value={{ headerColor, setHeaderColor, sparkleSettings, setSparkleSettings }}>
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
