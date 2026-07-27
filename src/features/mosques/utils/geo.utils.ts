import { EARTH_RADIUS_METERS, KABAH_COORDINATES } from '../constants/mosque.constants';
import type { Coordinates } from '../types/mosque.types';

/**
 * Dereceyi radyana çevirir.
 */
const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Haversine formülü ile iki koordinat arasındaki mesafeyi hesaplar (metre).
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
 */
export function formatCoordinates(
    lat: number,
    lon: number,
    precision = 4
): string {
    return `${lat.toFixed(precision)}, ${lon.toFixed(precision)}`;
}

/**
 * Metre cinsinden mesafeyi okunabilir formata çevirir.
 *
 * @example
 * formatDistance(450)   // "450 m"
 * formatDistance(1250)  // "1.2 km"
 * formatDistance(7500)  // "7.5 km"
 */
export function formatDistance(meters: number, locale = 'tr-TR'): string {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toLocaleString(locale, { maximumFractionDigits: 1 })} km`;
}

/**
 * Başlangıç noktasından Kabe'ye olan coğrafi bearing ( pusula yönü) hesaplar.
 *
 * @param lat - Başlangıç enlemi
 * @param lon - Başlangıç boylamı
 * @returns Kuzey=0, Doğu=90 olacak şekilde derece cinsinden bearing (0-360)
 */
export function calculateQiblaBearing(lat: number, lon: number): number {
    const [kabahLat, kabahLon] = KABAH_COORDINATES;

    const phi1 = toRadians(lat);
    const phi2 = toRadians(kabahLat);
    const deltaLambda = toRadians(kabahLon - lon);

    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x =
        Math.cos(phi1) * Math.sin(phi2) -
        Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
    const theta = Math.atan2(y, x);

    // atan2 returns radians; convert to degrees and normalize to 0-360
    const degrees = (theta * 180) / Math.PI;
    return (degrees + 360) % 360;
}

/**
 * Bearing (derece) -> 16 yönlü pusula etiketi (Türkçe).
 *
 * Sıralama: K=0, KD=1, D=2, GD=3, G=4, GB=5, B=6, KB=7 (her 22.5° dilim).
 */
export function bearingToCompass(degrees: number): string {
    const normalized = ((degrees % 360) + 360) % 360;
    const dirs: string[] = [
        'K',   // 0     (Kuzey)
        'KKD', // 22.5
        'KD',  // 45    (Kuzeydoğu)
        'DKD', // 67.5
        'D',   // 90    (Doğu)
        'DGD', // 112.5
        'GD',  // 135   (Güneydoğu)
        'GGD', // 157.5
        'G',   // 180   (Güney)
        'GGB', // 202.5
        'GB',  // 225   (Güneybatı)
        'BGB', // 247.5
        'B',   // 270   (Batı)
        'BKB', // 292.5
        'KB',  // 315   (Kuzeybatı)
        'KKB', // 337.5
    ];
    const index = Math.round(normalized / 22.5) % 16;
    return dirs[index];
}

/**
 * Yol tarifi için Google Maps deep link'i üretir.
 */
export function buildDirectionsUrl(
    fromLat: number,
    fromLon: number,
    toLat: number,
    toLon: number
): string {
    return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLon}&destination=${toLat},${toLon}&travelmode=driving`;
}

/**
 * İki koordinat arasında Google Maps Directions servisinden rota çeker.
 */
export async function fetchRoute(
    from: Coordinates,
    to: Coordinates
): Promise<Coordinates[]> {
    const [fromLat, fromLon] = from;
    const [toLat, toLon] = to;

    if (typeof window !== 'undefined' && 'google' in window && (window as unknown as { google: typeof google }).google?.maps?.DirectionsService) {
        return new Promise((resolve, reject) => {
            const googleObj = (window as unknown as { google: typeof google }).google;
            const directionsService = new googleObj.maps.DirectionsService();
            directionsService.route(
                {
                    origin: { lat: fromLat, lng: fromLon },
                    destination: { lat: toLat, lng: toLon },
                    travelMode: googleObj.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === googleObj.maps.DirectionsStatus.OK && result?.routes?.[0]?.overview_path) {
                        const path = result.routes[0].overview_path.map(
                            (point) => [point.lat(), point.lng()] as Coordinates
                        );
                        resolve(path);
                    } else {
                        reject(new Error(`Google Maps yol tarifi alınamadı (${status}).`));
                    }
                }
            );
        });
    }

    return [from, to];
}
