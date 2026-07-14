import { useEffect } from 'react';

export interface ShortcutMap {
    [key: string]: (event: KeyboardEvent) => void;
}

/**
 * Global klavye kısayolları.
 *
 * @example
 * useKeyboardShortcuts({
 *   '/': () => searchInputRef.current?.focus(),
 *   Escape: () => clearSearch(),
 * });
 */
export function useKeyboardShortcuts(map: ShortcutMap): void {
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            // Form alanlarında '/' gibi kısayolların tetiklenmesini engelle
            // (Escape her zaman çalışır)
            const target = event.target as HTMLElement | null;
            const isInput =
                target?.tagName === 'INPUT' ||
                target?.tagName === 'TEXTAREA' ||
                target?.isContentEditable;

            for (const key of Object.keys(map)) {
                if (key === 'Escape' || !isInput) {
                    // case-insensitive eşleşme (single char keys)
                    if (key.length === 1 && event.key.toLowerCase() === key.toLowerCase()) {
                        event.preventDefault();
                        map[key](event);
                        return;
                    }
                    if (event.key === key) {
                        event.preventDefault();
                        map[key](event);
                        return;
                    }
                }
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [map]);
}
