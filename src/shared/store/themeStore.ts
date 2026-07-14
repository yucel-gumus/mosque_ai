import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type DarkModeType = 'system' | 'light' | 'dark';

interface ThemeState {
    darkMode: DarkModeType;
    setDarkMode: (mode: DarkModeType) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            darkMode: 'system',
            setDarkMode: (mode) => set({ darkMode: mode }),
        }),
        {
            name: 'mosque-ai-theme-store',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
