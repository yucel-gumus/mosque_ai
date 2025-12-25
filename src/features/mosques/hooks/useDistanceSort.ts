import { useMemo } from 'react';
import type { Mosque, Coordinates } from '../types/mosque.types';
import { calculateDistance } from '../utils/geo.utils';

/**
 * Camileri kullanıcı konumuna göre mesafeye göre sıralar.
 *
 * @param mosques - Sıralanacak cami listesi
 * @param userCoords - Kullanıcı koordinatları (null ise orijinal sıra korunur)
 * @returns Mesafeye göre sıralanmış cami listesi
 *
 * @example
 * ```tsx
 * const { coords } = useGeolocation();
 * const sortedMosques = useDistanceSort(filteredMosques, coords);
 *
 * return <MosqueList mosques={sortedMosques} />;
 * ```
 */
export function useDistanceSort(
    mosques: Mosque[],
    userCoords: Coordinates | null
): Mosque[] {
    return useMemo(() => {
        // Boş liste veya koordinat yoksa orijinal sırayı koru
        if (!mosques.length || !userCoords) {
            return mosques;
        }

        const [userLat, userLon] = userCoords;

        // Yeni array oluştur (mutate etme) ve mesafeye göre sırala
        return [...mosques].sort((a, b) => {
            const distanceA = calculateDistance(a.lat, a.lon, userLat, userLon);
            const distanceB = calculateDistance(b.lat, b.lon, userLat, userLon);
            return distanceA - distanceB;
        });
    }, [mosques, userCoords]);
}
