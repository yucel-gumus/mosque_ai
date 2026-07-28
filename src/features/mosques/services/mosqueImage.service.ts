import { calculateBearing } from '../utils/geo.utils';
import type { Mosque } from '../types/mosque.types';

export interface MosqueImageResult {
    url: string | null;
    source: 'Google Places' | 'Wikipedia' | 'Google Street View' | 'Custom' | 'Pattern';
}

const memoryCache = new Map<string, MosqueImageResult>();

export function clearMosqueImageCache() {
    memoryCache.clear();
}

/**
 * Cami isminden arama anahtar kelimelerini temizler.

 */
function cleanMosqueNameForWiki(name: string): string {
    return name
        .trim()
        .replace(/\s+/g, ' ');
}

/**
 * Wikipedia TR API'sinden cami fotoğrafı çeker.
 */
export async function fetchWikipediaMosqueImage(mosqueName: string): Promise<string | null> {
    try {
        const cleanName = cleanMosqueNameForWiki(mosqueName);
        const endpoint = `https://tr.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(cleanName)}&prop=pageimages&format=json&pithumbsize=800&origin=*`;
        const res = await fetch(endpoint);
        if (!res.ok) return null;
        const data = await res.json();
        
        const pages = data?.query?.pages;
        if (!pages) return null;
        
        const pageId = Object.keys(pages)[0];
        if (!pageId || pageId === '-1') return null;
        
        const thumbnail = pages[pageId]?.thumbnail?.source;
        return thumbnail || null;
    } catch {
        return null;
    }
}

/**
 * Google Street View Metadata API kullanarak en yakın panoramadan camiye doğru açı (heading) hesaplar.
 */
export async function fetchDirectedStreetView(
    lat: number,
    lon: number,
    apiKey: string
): Promise<{ url: string; heading: number } | null> {
    if (!apiKey) return null;
    try {
        const metaUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lon}&key=${apiKey}`;
        const res = await fetch(metaUrl);
        if (!res.ok) return null;
        const data = await res.json();

        if (data.status === 'OK' && data.location) {
            const panoLat = data.location.lat;
            const panoLng = data.location.lng;
            
            // Panoramanın çekildiği noktadan caminin koordinatına açı hesapla
            const heading = Math.round(calculateBearing(panoLat, panoLng, lat, lon));
            // Cami kubbelerini ve minarelerini görmek için pitch açısını 12° yukarı kaldırıyoruz
            const svUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x320&location=${panoLat},${panoLng}&heading=${heading}&pitch=12&fov=80&key=${apiKey}`;
            return { url: svUrl, heading };
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Google Places Service kullanarak caminin gerçek Google harita fotoğrafını arar.
 */
export function fetchGooglePlacesMosqueImage(
    mosque: Mosque,
    placesLib: typeof google.maps.places
): Promise<string | null> {
    return new Promise((resolve) => {
        try {
            const container = document.createElement('div');
            const service = new placesLib.PlacesService(container);
            const query = `${mosque.name} ${mosque.district || ''} İstanbul`;

            service.findPlaceFromQuery(
                {
                    query,
                    fields: ['photos', 'name', 'place_id'],
                },
                (results, status) => {
                    if (
                        status === placesLib.PlacesServiceStatus.OK &&
                        results &&
                        results[0]?.photos &&
                        results[0].photos.length > 0
                    ) {
                        const photoUrl = results[0].photos[0].getUrl({
                            maxWidth: 800,
                            maxHeight: 600,
                        });
                        resolve(photoUrl);
                    } else {
                        resolve(null);
                    }
                }
            );
        } catch {
            resolve(null);
        }
    });
}

/**
 * Cami için çok katmanlı görsel çözümleme ana fonksiyonu.
 */
export async function getMosqueImage(
    mosque: Mosque,
    apiKey: string,
    placesLib?: typeof google.maps.places | null
): Promise<MosqueImageResult> {
    const cacheKey = `mosque_img_v2_${mosque.id}`;

    // 0. Bellek içi veya SessionStorage Önbellek Kontrolü
    if (memoryCache.has(cacheKey)) {
        return memoryCache.get(cacheKey)!;
    }

    try {
        const cachedRaw = sessionStorage.getItem(cacheKey);
        if (cachedRaw) {
            const parsed: MosqueImageResult = JSON.parse(cachedRaw);
            memoryCache.set(cacheKey, parsed);
            return parsed;
        }
    } catch (e) {
        void e;
    }


    // 1. Özel / GeoJSON içinde tanımlı görsel varsa
    if (mosque.image && (mosque.image.startsWith('http://') || mosque.image.startsWith('https://'))) {
        const result: MosqueImageResult = { url: mosque.image, source: 'Custom' };
        memoryCache.set(cacheKey, result);
        return result;
    }

    // 2. Google Places API Fotoğrafı (Eğer JS SDK yüklüyse)
    if (placesLib) {
        const placesUrl = await fetchGooglePlacesMosqueImage(mosque, placesLib);
        if (placesUrl) {
            const result: MosqueImageResult = { url: placesUrl, source: 'Google Places' };
            memoryCache.set(cacheKey, result);
            try { sessionStorage.setItem(cacheKey, JSON.stringify(result)); } catch (e) { void e; }
            return result;
        }
    }

    // 3. Wikipedia TR Görseli (Tarihi Camiler için)
    const wikiUrl = await fetchWikipediaMosqueImage(mosque.name);
    if (wikiUrl) {
        const result: MosqueImageResult = { url: wikiUrl, source: 'Wikipedia' };
        memoryCache.set(cacheKey, result);
        try { sessionStorage.setItem(cacheKey, JSON.stringify(result)); } catch (e) { void e; }
        return result;
    }

    // 4. Akıllı Yönlendirilmiş Google Street View (Hesaplanmış Heading + Pitch)
    const sv = await fetchDirectedStreetView(mosque.lat, mosque.lon, apiKey);
    if (sv) {
        const result: MosqueImageResult = { url: sv.url, source: 'Google Street View' };
        memoryCache.set(cacheKey, result);
        try { sessionStorage.setItem(cacheKey, JSON.stringify(result)); } catch (e) { void e; }
        return result;
    }


    // 5. Fallback Desen
    const fallbackResult: MosqueImageResult = { url: null, source: 'Pattern' };
    memoryCache.set(cacheKey, fallbackResult);
    return fallbackResult;
}
