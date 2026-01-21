'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SidePanelContextType {
  isOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
}

const SidePanelContext = createContext<SidePanelContextType | undefined>(undefined);

export function SidePanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openPanel = () => setIsOpen(true);
  const closePanel = () => setIsOpen(false);

  return (
    <SidePanelContext.Provider value={{ isOpen, openPanel, closePanel }}>
      {children}
    </SidePanelContext.Provider>
  );
}

export function useSidePanel() {
  const context = useContext(SidePanelContext);
  if (!context) {
    throw new Error('useSidePanel must be used within SidePanelProvider');
  }
  return context;
}
