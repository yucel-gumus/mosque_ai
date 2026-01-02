import type { Mosque, OverpassResponse, OverpassElement } from '../types/mosque.types';
import { OVERPASS_TIMEOUT } from '../constants/mosque.constants';
import { findDistrictByProximity } from './districtBoundariesApi';

const OVERPASS_SERVERS = [
    import.meta.env.VITE_OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const RETRY_CONFIG = {
    maxRetries: 2,
    baseDelayMs: 1000,
    timeoutMs: 30000,
};

const buildOverpassQuery = (body: string): string => `
[out:json][timeout:${OVERPASS_TIMEOUT}];
area["name"="İstanbul"]["admin_level"="4"]->.istanbul;

(
${body}
);

out center tags;
`;

const normalizeDistrict = (district: string | undefined): string | undefined => {
    if (!district) return undefined;
    const trimmed = district.trim();
    if (!trimmed) return undefined;
    return trimmed.charAt(0).toLocaleUpperCase('tr-TR') + trimmed.slice(1).toLocaleLowerCase('tr-TR');
};

const parseElement = (element: OverpassElement): Mosque | null => {
    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;

    if (typeof lat !== 'number' || typeof lon !== 'number') {
        return null;
    }

    const tags = element.tags ?? {};
    const name = tags['name:tr'] || tags.name || 'İsimsiz Cami';
    const rawDistrict = tags['addr:district'] || tags.district;

    return {
        id: element.id,
        name,
        lat,
        lon,
        district: normalizeDistrict(rawDistrict),
        neighborhood: tags['addr:suburb'] || tags.suburb || tags.neighbourhood,
        wikidata: tags.wikidata,
        osmUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    };
};

const deduplicateByCoordinates = (mosques: Mosque[]): Mosque[] => {
    const seen = new Set<string>();

    return mosques.filter((mosque) => {
        const key = `${mosque.lat},${mosque.lon}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
};

const enrichMosquesWithDistricts = (mosques: Mosque[]): Mosque[] => {
    return mosques.map((mosque) => {
        if (mosque.district) return mosque;

        const district = findDistrictByProximity(mosque.lat, mosque.lon);
        return district ? { ...mosque, district } : mosque;
    });
};

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
};

const tryFetchFromServer = async (serverUrl: string, queryBody: string): Promise<OverpassResponse> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const delayMs = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt - 1);
                await delay(delayMs);
            }

            const response = await fetchWithTimeout(
                serverUrl,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ data: buildOverpassQuery(queryBody) }),
                },
                RETRY_CONFIG.timeoutMs
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
        }
    }

    throw lastError ?? new Error('Bilinmeyen hata');
};

export async function fetchMosques(queryBody: string): Promise<Mosque[]> {
    let lastError: Error | null = null;

    for (const serverUrl of OVERPASS_SERVERS) {
        try {
            const data = await tryFetchFromServer(serverUrl, queryBody);

            const mosques = data.elements
                .map(parseElement)
                .filter((mosque): mosque is Mosque => mosque !== null);

            const uniqueMosques = deduplicateByCoordinates(mosques);
            const enrichedMosques = enrichMosquesWithDistricts(uniqueMosques);

            return enrichedMosques.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
        }
    }

    throw new Error(`Tüm Overpass sunucuları başarısız oldu. Son hata: ${lastError?.message}`);
}

