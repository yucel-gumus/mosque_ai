import { useState, useEffect, useMemo } from 'react';
import type { Mosque, GeoJSONFeatureCollection } from '../types/mosque.types';

interface UseMosquesResult {
    mosques: Mosque[];
    districts: string[];
    isLoading: boolean;
    error: Error | null;
}

const normalizeDistrict = (district: string | undefined): string | undefined => {
    if (!district) return undefined;
    const trimmed = district.trim();
    if (!trimmed) return undefined;
    return trimmed.charAt(0).toLocaleUpperCase('tr-TR') + trimmed.slice(1).toLocaleLowerCase('tr-TR');
};

const extractId = (osmId: string): number => {
    const match = osmId.match(/(node|way|relation)\/(\d+)/);
    if (!match) return 0;
    const typeOffset = { node: 0, way: 1_000_000_000, relation: 2_000_000_000 };
    return (typeOffset[match[1] as keyof typeof typeOffset] ?? 0) + parseInt(match[2], 10);
};

const processGeoJSON = (data: GeoJSONFeatureCollection): Mosque[] => {
    return data.features
        .filter((f) => f.properties.name)
        .map((f) => ({
            id: extractId(f.properties['@id']),
            name: f.properties.name ?? f.properties['name:tr'] ?? 'İsimsiz Cami',
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            district: normalizeDistrict(f.properties['addr:district']),
            neighborhood: f.properties['addr:neighbourhood'],
            wikidata: f.properties.wikidata,
            wikipedia: f.properties.wikipedia,
            osmUrl: `https://www.openstreetmap.org/${f.properties['@id']}`,
            architect: f.properties.architect,
            image: f.properties.image,
            website: f.properties.website,
            capacity: f.properties.capacity,
            wheelchair: f.properties.wheelchair,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
};

const fetchAndProcessMosques = async (): Promise<Mosque[]> => {
    const res = await fetch(`${import.meta.env.BASE_URL}mosques-geojson.json`);
    if (!res.ok) {
        throw new Error(`Cami verisi yüklenemedi: ${res.statusText}`);
    }
    const data = await res.json() as GeoJSONFeatureCollection;
    return processGeoJSON(data);
};

export function useMosques(): UseMosquesResult {
    const [mosques, setMosques] = useState<Mosque[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        fetchAndProcessMosques()
            .then((processed) => {
                if (isMounted) {
                    setMosques(processed);
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                console.error('Failed to load mosques:', err);
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('Veri yüklenemedi'));
                    setMosques([]);
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const districts = useMemo(() => {
        const set = new Set<string>();
        for (const m of mosques) {
            if (m.district) set.add(m.district);
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
    }, [mosques]);

    return { mosques, districts, isLoading, error };
}
