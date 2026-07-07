import { createContext, useContext, useState, useEffect } from 'react';

type SidebarContextType = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  toggle: () => {},
  open: () => {},
  close: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar-open');
    if (saved !== null) return saved === 'true';
    return window.innerWidth >= 1024; // default open on desktop, closed on mobile
  });

  const toggle = () => setIsOpen(prev => {
    localStorage.setItem('sidebar-open', String(!prev));
    return !prev;
  });
  const open = () => { setIsOpen(true); localStorage.setItem('sidebar-open', 'true'); };
  const close = () => { setIsOpen(false); localStorage.setItem('sidebar-open', 'false'); };

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, open, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebarState = () => useContext(SidebarContext);
