// React imports removed as they are no longer needed
import type { Mosque, FetchStatus, MosquesDataFile } from '../types/mosque.types';
import mosquesData from '../../../data/mosques.json';


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

const data = mosquesData as unknown as MosquesDataFile;

// Process data immediately
const processedMosques: Mosque[] = data.mosques.map((m) => ({
    id: m.osm_id,
    name: m.name ?? m.name_tr ?? 'İsimsiz Cami',
    lat: m.latitude,
    lon: m.longitude,
    district: normalizeDistrict(m.tags['addr:district']),
    neighborhood: m.tags['addr:subdistrict'],
    wikidata: m.tags['wikidata'],
    osmUrl: `https://www.openstreetmap.org/${m.osm_type}/${m.osm_id}`,
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

