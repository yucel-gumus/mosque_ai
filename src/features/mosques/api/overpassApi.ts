import type { Mosque, OverpassResponse, OverpassElement } from '../types/mosque.types';
import { OVERPASS_API_URL, OVERPASS_TIMEOUT } from '../constants/mosque.constants';
import { findDistrictByProximity } from './districtBoundariesApi';

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

export async function fetchMosques(queryBody: string): Promise<Mosque[]> {
    const response = await fetch(OVERPASS_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ data: buildOverpassQuery(queryBody) }),
    });

    if (!response.ok) {
        throw new Error(`Overpass API hatası: ${response.status} ${response.statusText}`);
    }

    const data: OverpassResponse = await response.json();

    const mosques = data.elements
        .map(parseElement)
        .filter((mosque): mosque is Mosque => mosque !== null);

    const uniqueMosques = deduplicateByCoordinates(mosques);

    const enrichedMosques = enrichMosquesWithDistricts(uniqueMosques);

    return enrichedMosques.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}
