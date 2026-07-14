import L from 'leaflet';
import type { Coordinates } from '../types/mosque.types';

export const ISTANBUL_CENTER: Coordinates = [41.0082, 28.9784];

export const ISTANBUL_BOUNDS = L.latLngBounds([40.802, 28.209], [41.376, 29.513]);

export const MAP_CONFIG = {
    DEFAULT_ZOOM: 13,
    FLY_TO_ZOOM: 16,
    FLY_DURATION: 1,
    MIN_ZOOM: 10,
    MAX_ZOOM: 19,
} as const;

export const GEOLOCATION_CONFIG = {
    ENABLE_HIGH_ACCURACY: true,
    TIMEOUT: 10000,
} as const;

export const EARTH_RADIUS_METERS = 6_371_000;

/** Kabe koordinatları (Mekke, Suudi Arabistan) - kıble yönü hesabı için. */
export const KABAH_COORDINATES: Coordinates = [21.4225, 39.8262];

/** Yarıçap slider'ı için metre cinsinden sınırlar. */
export const RADIUS_LIMITS = {
    MIN: 100,
    MAX: 5_000,
    STEP: 100,
    DEFAULT: 1_500,
} as const;

/** Diyanet namaz vakti endpoint'i (anonim JSON proxy üzerinden). */
export const PRAYER_TIMES_ENDPOINT =
    'https://api.aladhan.com/v1/timings';

/** PWA cache ayarları. */
export const PWA_CONFIG = {
    APP_NAME: 'İstanbul Camileri',
    SHORT_NAME: 'Camiler',
    THEME_COLOR: '#0ea5e9',
    BACKGROUND_COLOR: '#0b1220',
} as const;
