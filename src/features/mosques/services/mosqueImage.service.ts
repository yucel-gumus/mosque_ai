import type { Mosque } from '../types/mosque.types';

export interface MosqueImageResult {
    url: string | null;
    source: 'Google Places' | 'Wikipedia' | 'Google Street View' | 'Custom' | 'Pattern' | 'BFF Proxy';
}

const memoryCache = new Map<string, MosqueImageResult>();
const inflight = new Map<string, Promise<MosqueImageResult>>();

const BFF_BASE = (
    (import.meta.env.VITE_BFF_API_URL as string | undefined) ||
    (import.meta.env.PROD ? 'https://pages-bff.vercel.app' : '')
).replace(/\/$/, '');

export function clearMosqueImageCache() {
    memoryCache.clear();
    inflight.clear();
}

/**
 * True if URL is a Google Maps/Places/Static/Street View URL that may embed key=
 */
function isGoogleMapsKeyBearingUrl(url: string): boolean {
    try {
        const u = new URL(url);
        if (!u.hostname.endsWith('googleapis.com') && !u.hostname.endsWith('google.com')) {
            return false;
        }
        return (
            u.pathname.includes('/maps/') ||
            u.pathname.includes('/place/') ||
            u.searchParams.has('key')
        );
    } catch {
        return false;
    }
}

function testImageLoad(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        let settled = false;
        const done = (ok: boolean) => {
            if (settled) return;
            settled = true;
            resolve(ok);
        };
        const img = new Image();
        img.onload = () => done(true);
        img.onerror = () => done(false);
        img.src = url;
        setTimeout(() => done(false), 8000);
    });
}

/**
 * Cami isminden arama anahtar kelimelerini temizler.
 */
function cleanMosqueNameForWiki(name: string): string {
    return name.trim().replace(/\s+/g, ' ');
}

/**
 * Wikipedia TR API'sinden cami fotoğrafı çeker (public, no secrets).
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
 * Same-origin / BFF photo stream URL.
 * Edge fetches Google Places / directed Street View server-side — no key in browser.
 */
export function buildMosquePhotoStreamUrl(mosque: Mosque): string {
    const params = new URLSearchParams({
        name: mosque.name,
        mode: 'image',
        lat: String(mosque.lat),
        lng: String(mosque.lon),
    });
    if (mosque.district) {
        params.set('district', mosque.district);
    }
    params.set('city', 'İstanbul');

    // Dev: vite proxy /api → pages-bff; Prod: absolute BFF or relative if same host
    if (BFF_BASE) {
        return `${BFF_BASE}/api/mosque/photo?${params.toString()}`;
    }
    return `/api/mosque/photo?${params.toString()}`;
}

/**
 * @deprecated Client-side Street View with API key is removed for security.
 * Kept as no-op export so older tests/imports fail loudly if misused.
 */
export async function fetchDirectedStreetView(
    _lat: number,
    _lon: number,
    _apiKey: string
): Promise<{ url: string; heading: number } | null> {
    // Security: never build maps.googleapis.com URLs with key= in the browser.
    return null;
}

/**
 * @deprecated Places JS photo URLs embed browser keys; use BFF stream instead.
 */
export function fetchGooglePlacesMosqueImage(
    _mosque: Mosque,
    _placesLib: typeof google.maps.places
): Promise<string | null> {
    return Promise.resolve(null);
}

function persistResult(cacheKey: string, result: MosqueImageResult): MosqueImageResult {
    memoryCache.set(cacheKey, result);
    try {
        sessionStorage.setItem(cacheKey, JSON.stringify(result));
    } catch {
        // ignore quota / private mode
    }
    return result;
}

/**
 * Cami için güvenli görsel çözümleme:
 * Custom → BFF photo stream (Places + directed SV) → Wikipedia → Pattern
 * Google API keys never appear in image URLs.
 */
export async function getMosqueImage(
    mosque: Mosque,
    _apiKey?: string,
    _placesLib?: typeof google.maps.places | null
): Promise<MosqueImageResult> {
    const cacheKey = `mosque_img_v3_${mosque.id}`;

    if (memoryCache.has(cacheKey)) {
        return memoryCache.get(cacheKey)!;
    }

    try {
        const cachedRaw = sessionStorage.getItem(cacheKey);
        if (cachedRaw) {
            const parsed: MosqueImageResult = JSON.parse(cachedRaw);
            // Invalidate legacy cache entries that embedded Google keys
            if (parsed.url && isGoogleMapsKeyBearingUrl(parsed.url)) {
                sessionStorage.removeItem(cacheKey);
            } else {
                memoryCache.set(cacheKey, parsed);
                return parsed;
            }
        }
    } catch {
        // ignore
    }

    if (inflight.has(cacheKey)) {
        return inflight.get(cacheKey)!;
    }

    const work = (async (): Promise<MosqueImageResult> => {
        // 1. Custom / GeoJSON image (reject Google key-bearing URLs)
        if (
            mosque.image &&
            (mosque.image.startsWith('http://') || mosque.image.startsWith('https://')) &&
            !isGoogleMapsKeyBearingUrl(mosque.image)
        ) {
            return persistResult(cacheKey, { url: mosque.image, source: 'Custom' });
        }

        // 2. BFF stream: Places photo → directed Street View → Static (server-side keys only)
        try {
            const streamUrl = buildMosquePhotoStreamUrl(mosque);
            const ok = await testImageLoad(streamUrl);
            if (ok) {
                return persistResult(cacheKey, { url: streamUrl, source: 'BFF Proxy' });
            }
        } catch (err) {
            console.warn('BFF mosque photo stream failed:', err);
        }

        // 3. Wikipedia TR (public)
        const wikiUrl = await fetchWikipediaMosqueImage(mosque.name);
        if (wikiUrl) {
            return persistResult(cacheKey, { url: wikiUrl, source: 'Wikipedia' });
        }

        // 4. Pattern fallback
        return persistResult(cacheKey, { url: null, source: 'Pattern' });
    })();

    inflight.set(cacheKey, work);
    try {
        return await work;
    } finally {
        inflight.delete(cacheKey);
    }
}
