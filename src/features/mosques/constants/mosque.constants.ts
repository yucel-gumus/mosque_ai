import L from 'leaflet';
import type { Coordinates } from '../types/mosque.types';

/**
 * İstanbul merkez koordinatları.
 * Konum alınamadığında fallback olarak kullanılır.
 */
export const ISTANBUL_CENTER: Coordinates = [41.0082, 28.9784];

/**
 * İstanbul il sınırları.
 * Harita bu sınırların dışına kaydırılamaz.
 */
export const ISTANBUL_BOUNDS = L.latLngBounds([40.802, 28.209], [41.376, 29.513]);

/**
 * Varsayılan Overpass API sorgu gövdesi.
 * İstanbul'daki tüm camileri çeker.
 */
export const DEFAULT_QUERY_BODY = `
  nwr["amenity"="place_of_worship"]["religion"="muslim"](area.istanbul);
  nwr["building"="mosque"](area.istanbul);
`.trim();

/**
 * Overpass API endpoint URL'i.
 */
export const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Overpass API timeout süresi (saniye).
 */
export const OVERPASS_TIMEOUT = 60;

/**
 * Liste limiti ayarları.
 */
export const LIST_LIMIT = {
    MIN: 5,
    MAX: 500,
    DEFAULT: 10,
    STEP: 5,
} as const;

/**
 * Harita konfigürasyonu.
 */
export const MAP_CONFIG = {
    /** Varsayılan zoom seviyesi */
    DEFAULT_ZOOM: 13,
    /** Seçili camiye uçarken zoom seviyesi */
    FLY_TO_ZOOM: 16,
    /** Uçuş animasyonu süresi (saniye) */
    FLY_DURATION: 1,
} as const;

/**
 * Geolocation API ayarları.
 */
export const GEOLOCATION_CONFIG = {
    ENABLE_HIGH_ACCURACY: true,
    TIMEOUT: 10000,
} as const;

/**
 * Dünya yarıçapı (metre cinsinden).
 * Haversine formülü için kullanılır.
 */
export const EARTH_RADIUS_METERS = 6_371_000;
