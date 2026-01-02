// React imports removed as they are no longer needed
import type { Mosque, FetchStatus } from '../types/mosque.types';
import mosquesData from '../../../data/mosques.json';

interface MosquesDataFile {
    fetchedAt: string;
    totalCount: number;
    withDistrict: number;
    withoutDistrict: number;
    mosques: Array<{
        id: number;
        type: string;
        name: string;
        lat: number;
        lon: number;
        district?: string;
        neighborhood?: string;
        street?: string;
        wikidata?: string;
        osmUrl: string;
    }>;
}

interface UseMosquesResult {
    mosques: Mosque[];
    status: FetchStatus;
    error: string | null;
    refetch: () => void;
    forceRefresh: () => void;
}

const normalizeDistrict = (district: string | undefined): string | undefined => {
    if (!district) return undefined;
    const trimmed = district.trim();
    if (!trimmed) return undefined;
    return trimmed.charAt(0).toLocaleUpperCase('tr-TR') + trimmed.slice(1).toLocaleLowerCase('tr-TR');
};

const data = mosquesData as MosquesDataFile;

// Process data immediately
const processedMosques: Mosque[] = data.mosques.map((m) => ({
    id: m.id,
    name: m.name,
    lat: m.lat,
    lon: m.lon,
    district: normalizeDistrict(m.district),
    neighborhood: m.neighborhood,
    wikidata: m.wikidata,
    osmUrl: m.osmUrl,
})).sort((a, b) => a.name.localeCompare(b.name, 'tr'));

export function useMosques(): UseMosquesResult {
    // Since data is static, we can return it immediately with success status
    return {
        mosques: processedMosques,
        status: 'success',
        error: null,
        refetch: () => { },
        forceRefresh: () => { }
    };
}

