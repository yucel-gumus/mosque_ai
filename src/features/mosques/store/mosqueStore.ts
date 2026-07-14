import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TileLayerId, Coordinates } from '../types/mosque.types';
import { RADIUS_LIMITS } from '../constants/mosque.constants';

interface FilterState {
    district: string | null;
    radius: number | null;
    wheelchairOnly: boolean;
}

interface UiState {
    sidebarOpen: boolean;
    assistantOpen: boolean;
    tileLayer: TileLayerId;
}

interface MosqueStoreState {
    // Selection
    selectedId: number | null;
    selectMosque: (id: number | null) => void;

    // Filters
    filters: FilterState;
    setDistrict: (district: string | null) => void;
    setRadius: (radius: number | null) => void;
    setWheelchairOnly: (value: boolean) => void;
    resetFilters: () => void;

    // Search
    searchQuery: string;
    setSearchQuery: (q: string) => void;

    // Favorites
    favorites: number[];
    toggleFavorite: (id: number) => void;
    isFavorite: (id: number) => boolean;

    // UI
    ui: UiState;
    toggleSidebar: () => void;
    toggleAssistant: () => void;
    setTileLayer: (layer: TileLayerId) => void;

    // Route
    route: Coordinates[] | null;
    setRoute: (route: Coordinates[] | null) => void;
    isLoadingRoute: boolean;
    setIsLoadingRoute: (value: boolean) => void;
    routeError: string | null;
    setRouteError: (error: string | null) => void;
}

const defaultFilters: FilterState = {
    district: null,
    radius: null,
    wheelchairOnly: false,
};

const defaultUi: UiState = {
    sidebarOpen: true,
    assistantOpen: false,
    tileLayer: 'voyager',
};

export const useMosqueStore = create<MosqueStoreState>()(
    persist(
        (set, get) => ({
            selectedId: null,
            selectMosque: (id) => set({ selectedId: id, route: null, routeError: null }),

            filters: { ...defaultFilters },
            setDistrict: (district) =>
                set((state) => ({ filters: { ...state.filters, district }, route: null, routeError: null })),
            setRadius: (radius) =>
                set((state) => ({ filters: { ...state.filters, radius }, route: null, routeError: null })),
            setWheelchairOnly: (value) =>
                set((state) => ({ filters: { ...state.filters, wheelchairOnly: value }, route: null, routeError: null })),
            resetFilters: () => set({ filters: { ...defaultFilters }, route: null, routeError: null }),

            route: null,
            setRoute: (route) => set({ route }),
            isLoadingRoute: false,
            setIsLoadingRoute: (value) => set({ isLoadingRoute: value }),
            routeError: null,
            setRouteError: (error) => set({ routeError: error }),

            searchQuery: '',
            setSearchQuery: (q) => set({ searchQuery: q }),

            favorites: [],
            toggleFavorite: (id) =>
                set((state) => {
                    const exists = state.favorites.includes(id);
                    return {
                        favorites: exists
                            ? state.favorites.filter((f) => f !== id)
                            : [...state.favorites, id],
                    };
                }),
            isFavorite: (id) => get().favorites.includes(id),

            ui: { ...defaultUi },
            toggleSidebar: () =>
                set((state) => ({ ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } })),
            toggleAssistant: () =>
                set((state) => ({ ui: { ...state.ui, assistantOpen: !state.ui.assistantOpen } })),
            setTileLayer: (layer) =>
                set((state) => ({ ui: { ...state.ui, tileLayer: layer } })),
        }),
        {
            name: 'mosque-ai-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                favorites: state.favorites,
                ui: { tileLayer: state.ui.tileLayer },
                filters: state.filters,
            }),
        }
    )
);

export const RADIUS_DEFAULTS = RADIUS_LIMITS;
