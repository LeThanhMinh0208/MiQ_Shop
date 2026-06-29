import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      dark: false,
      toggle: () => set((s) => ({ dark: !s.dark })),
      setDark: (v) => set({ dark: v }),
    }),
    { name: 'miq-theme' }
  )
);

// Session-only: dynamic primary color driven by hero product accent
export const useColorStore = create((set) => ({
  primaryColor: '#E8590C',
  primaryRGB:   '232, 89, 12',
  setPrimaryColor: (hex, rgb) => {
    document.documentElement.style.setProperty('--primary-dynamic', hex);
    document.documentElement.style.setProperty('--primary-rgb', rgb);
    set({ primaryColor: hex, primaryRGB: rgb });
  },
}));
