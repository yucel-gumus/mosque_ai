import { useState, useEffect } from 'react';
import type { Mosque, GeoJSONFeatureCollection } from '../types/mosque.types';

interface UseMosquesResult {
    mosques: Mosque[];
    isLoading: boolean;
}

const normalizeDistrict = (district: string | undefined): string | undefined => {
    if (!district) return undefined;
    const trimmed = district.trim();
    if (!trimmed) return undefined;
    return trimmed.charAt(0).toLocaleUpperCase('tr-TR') + trimmed.slice(1).toLocaleLowerCase('tr-TR');
};

const extractNumericId = (osmId: string): number => {
    const match = osmId.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
};

const processGeoJSON = (data: GeoJSONFeatureCollection): Mosque[] => {
    return data.features
        .filter((f) => f.properties.name)
        .map((f) => ({
            id: extractNumericId(f.properties['@id']),
            name: f.properties.name ?? f.properties['name:tr'] ?? 'İsimsiz Cami',
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            district: normalizeDistrict(f.properties['addr:district']),
            neighborhood: f.properties['addr:neighbourhood'],
            wikidata: f.properties.wikidata,
            wikipedia: f.properties.wikipedia,
            osmUrl: `https://www.openstreetmap.org/${f.properties['@id'].replace('/', '/')}`,
            architect: f.properties.architect,
            image: f.properties.image,
            website: f.properties.website,
            capacity: f.properties.capacity,
            wheelchair: f.properties.wheelchair,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
};

let cachedMosques: Mosque[] | null = null;

export function useMosques(): UseMosquesResult {
    const [mosques, setMosques] = useState<Mosque[]>(cachedMosques ?? []);
    const [isLoading, setIsLoading] = useState(!cachedMosques);

    useEffect(() => {
        if (cachedMosques) return;

        import('../../../data/mosques-geojson.json').then((module) => {
            const data = module.default as unknown as GeoJSONFeatureCollection;
            const processed = processGeoJSON(data);
            cachedMosques = processed;
            setMosques(processed);
            setIsLoading(false);
        });
    }, []);

    return { mosques, isLoading };
}
