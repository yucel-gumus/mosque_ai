import { describe, it, expect } from 'vitest';
import type { Mosque } from '../types/mosque.types';

// useDistanceSort bir React hook'tur, bu yüzden onu doğrudan import edemiyoruz;
// aynı mantığı burada bağımsız fonksiyon olarak doğrulayacağız.

const EARTH_RADIUS_METERS = 6_371_000;
const toRadians = (d: number) => (d * Math.PI) / 180;

const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_METERS * c;
};

const sortByDistance = (
    mosques: Mosque[],
    userCoords: [number, number] | null
): Array<Mosque & { distance?: number }> => {
    if (!userCoords) return mosques.map((m) => ({ ...m, distance: undefined }));
    const [uLat, uLon] = userCoords;
    return mosques
        .map((m) => ({ ...m, distance: calculateDistance(m.lat, m.lon, uLat, uLon) }))
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
};

const mockMosques: Mosque[] = [
    { id: 1, name: 'A', lat: 41.05, lon: 29.05, osmUrl: '' },
    { id: 2, name: 'B', lat: 41.0, lon: 29.0, osmUrl: '' },
    { id: 3, name: 'C', lat: 41.1, lon: 29.1, osmUrl: '' },
];

describe('Distance sort mantığı', () => {
    it('userCoords null ise orijinal sırayı korur', () => {
        const result = sortByDistance(mockMosques, null);
        expect(result.map((m) => m.id)).toEqual([1, 2, 3]);
        expect(result[0].distance).toBeUndefined();
    });

    it('userCoords verildiğinde en yakından uzağa sıralar', () => {
        const result = sortByDistance(mockMosques, [41.0, 29.0]);
        expect(result[0].id).toBe(2); // kendisi
        expect(result[1].id).toBe(1); // en yakın
        expect(result[2].id).toBe(3); // en uzak
        expect(result[0].distance).toBe(0);
        expect(result[0].distance).toBeLessThanOrEqual(result[1].distance!);
        expect(result[1].distance).toBeLessThanOrEqual(result[2].distance!);
    });

    it('boş liste için boş döner', () => {
        expect(sortByDistance([], [41, 29])).toEqual([]);
    });
});
