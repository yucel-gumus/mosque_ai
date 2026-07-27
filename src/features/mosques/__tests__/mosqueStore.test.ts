import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react';
import { useMosqueStore } from '../store/mosqueStore';

describe('mosqueStore', () => {
    beforeEach(() => {
        // Reset between tests
        useMosqueStore.setState({
            selectedId: null,
            filters: { district: 'Üsküdar', radius: null, wheelchairOnly: false, hasParking: false, hasWomenArea: false },
            searchQuery: '',
            favorites: [],
            ui: {
                sidebarOpen: true,
                assistantOpen: false,
                ramadanMode: true,
                tileLayer: 'roadmap',
            },
        });
    });

    it('selectMosque id set eder', () => {
        act(() => {
            useMosqueStore.getState().selectMosque(42);
        });
        expect(useMosqueStore.getState().selectedId).toBe(42);
    });

    it('selectMosque(null) seçimi temizler', () => {
        act(() => {
            useMosqueStore.getState().selectMosque(42);
            useMosqueStore.getState().selectMosque(null);
        });
        expect(useMosqueStore.getState().selectedId).toBeNull();
    });

    it('toggleFavorite ekler ve kaldırır', () => {
        act(() => {
            useMosqueStore.getState().toggleFavorite(7);
        });
        expect(useMosqueStore.getState().favorites).toContain(7);

        act(() => {
            useMosqueStore.getState().toggleFavorite(7);
        });
        expect(useMosqueStore.getState().favorites).not.toContain(7);
    });

    it('resetFilters tüm filtreleri varsayılana çevirir', () => {
        act(() => {
            useMosqueStore.getState().setDistrict('Kadıköy');
            useMosqueStore.getState().setRadius(1500);
            useMosqueStore.getState().setWheelchairOnly(true);
        });
        act(() => {
            useMosqueStore.getState().resetFilters();
        });
        const f = useMosqueStore.getState().filters;
        expect(f.district).toBe('Üsküdar');
        expect(f.radius).toBeNull();
        expect(f.wheelchairOnly).toBe(false);
    });

    it('setSearchQuery arama state\'ini günceller', () => {
        act(() => {
            useMosqueStore.getState().setSearchQuery('sultan');
        });
        expect(useMosqueStore.getState().searchQuery).toBe('sultan');
    });

    it('isFavorite doğru sonucu döner', () => {
        act(() => {
            useMosqueStore.getState().toggleFavorite(11);
        });
        expect(useMosqueStore.getState().isFavorite(11)).toBe(true);
        expect(useMosqueStore.getState().isFavorite(12)).toBe(false);
    });
});
