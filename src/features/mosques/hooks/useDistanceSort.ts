import { useMemo } from 'react';
import type { Mosque, Coordinates } from '../types/mosque.types';
import { calculateDistance } from '../utils/geo.utils';

export interface SortedMosque extends Mosque {
    /** Kullanıcıya olan metre cinsinden mesafe. userCoords null ise undefined. */
    distance?: number;
}

/**
 * Camileri kullanıcı konumuna göre mesafeye göre sıralar.
 *
 * Performance: Mesafeler, mosques array'inin referansı değişmediği sürece cache'lenir;
 * userCoords değişiminde yalnızca yeniden sıralama yapılır, hesaplama tekrarlanmaz.
 */
export function useDistanceSort(
    mosques: Mosque[],
    userCoords: Coordinates | null
): SortedMosque[] {
    // 1) Mesafe cache'i — mosques değişmediği sürece haversine tekrar hesaplanmaz.
    const withDistance = useMemo<SortedMosque[]>(() => {
        if (!userCoords) {
            return mosques.map((m) => ({ ...m, distance: undefined }));
        }
        const [userLat, userLon] = userCoords;
        return mosques.map((m) => ({
            ...m,
            distance: calculateDistance(m.lat, m.lon, userLat, userLon),
        }));
    }, [mosques, userCoords]);

    // 2) Sıralama. userCoords olmadığında orijinal sırayı koru (alfabetik).
    return useMemo(() => {
        if (!userCoords) return withDistance;
        return [...withDistance].sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    }, [withDistance, userCoords]);
}
