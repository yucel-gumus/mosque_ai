import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export function useDarkMode(): void {
    const darkMode = useThemeStore((s) => s.darkMode);

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (theme: 'light' | 'dark') => {
            if (theme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        if (darkMode === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            applyTheme(systemTheme);

            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e: MediaQueryListEvent) => {
                applyTheme(e.matches ? 'dark' : 'light');
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => {
                mediaQuery.removeEventListener('change', handleChange);
            };
        } else {
            applyTheme(darkMode);
        }
    }, [darkMode]);
}
