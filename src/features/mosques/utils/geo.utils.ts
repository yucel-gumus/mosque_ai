import { EARTH_RADIUS_METERS } from '../constants/mosque.constants';

/**
 * Dereceyi radyana çevirir.
 *
 * @param degrees - Derece cinsinden açı
 * @returns Radyan cinsinden açı
 */
const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Haversine formülü ile iki koordinat arasındaki mesafeyi hesaplar.
 *
 * @param lat1 - Birinci noktanın enlemi
 * @param lon1 - Birinci noktanın boylamı
 * @param lat2 - İkinci noktanın enlemi
 * @param lon2 - İkinci noktanın boylamı
 * @returns Mesafe (metre cinsinden)
 *
 * @example
 * ```typescript
 * const distance = calculateDistance(41.0082, 28.9784, 41.0136, 28.9550);
 * console.log(`Mesafe: ${distance.toFixed(0)} metre`);
 * ```
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_METERS * c;
}

/**
 * Koordinatları formatlı string olarak döndürür.
 *
 * @param lat - Enlem
 * @param lon - Boylam
 * @param precision - Ondalık basamak sayısı (varsayılan: 4)
 * @returns Formatlanmış koordinat string'i
 */
export function formatCoordinates(
    lat: number,
    lon: number,
    precision = 4
): string {
    return `${lat.toFixed(precision)}, ${lon.toFixed(precision)}`;
}
