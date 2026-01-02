import L from 'leaflet';
import type { Coordinates } from '../types/mosque.types';

export const ISTANBUL_CENTER: Coordinates = [41.0082, 28.9784];

export const ISTANBUL_BOUNDS = L.latLngBounds([40.802, 28.209], [41.376, 29.513]);


export const MAP_CONFIG = {
    DEFAULT_ZOOM: 13,
    FLY_TO_ZOOM: 16,
    FLY_DURATION: 1,
} as const;

export const GEOLOCATION_CONFIG = {
    ENABLE_HIGH_ACCURACY: true,
    TIMEOUT: 10000,
} as const;

export const EARTH_RADIUS_METERS = 6_371_000;

