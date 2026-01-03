import type { Mosque, GeoJSONFeatureCollection } from '../types/mosque.types';
import geojsonData from '../../../data/mosques-geojson.json';

interface UseMosquesResult {
    mosques: Mosque[];
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

const data = geojsonData as unknown as GeoJSONFeatureCollection;

const processedMosques: Mosque[] = data.features
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

export function useMosques(): UseMosquesResult {
    return {
        mosques: processedMosques,
    };
}
