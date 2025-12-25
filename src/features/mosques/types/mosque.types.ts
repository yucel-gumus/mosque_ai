/**
 * Cami verisi için tip tanımı.
 * @description OpenStreetMap'ten alınan cami verisinin normalize edilmiş hali.
 */
export interface Mosque {
    /** OpenStreetMap element ID */
    id: number;
    /** Caminin adı (name:tr veya name tag'inden) */
    name: string;
    /** Enlem koordinatı */
    lat: number;
    /** Boylam koordinatı */
    lon: number;
    /** İlçe adı (opsiyonel) */
    district?: string;
    /** Mahalle adı (opsiyonel) */
    neighborhood?: string;
    /** Wikidata ID (opsiyonel) */
    wikidata?: string;
    /** OpenStreetMap URL'i */
    osmUrl: string;
}

/**
 * Overpass API'den dönen ham element tipi.
 */
export interface OverpassElement {
    id: number;
    type: 'node' | 'way' | 'relation';
    lat?: number;
    lon?: number;
    center?: {
        lat: number;
        lon: number;
    };
    tags?: Record<string, string>;
}

/**
 * Overpass API response tipi.
 */
export interface OverpassResponse {
    version: number;
    generator: string;
    elements: OverpassElement[];
}

/**
 * Filtre state'i için tip tanımı.
 */
export interface MosqueFilterState {
    /** Seçili ilçe ('all' veya ilçe adı) */
    district: string;
    /** Listede gösterilecek maksimum cami sayısı */
    listLimit: number;
}

/**
 * API çağrı durumu için tip tanımı.
 */
export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Koordinat tuple tipi.
 */
export type Coordinates = [number, number];

export type Polygon = Coordinates[];

export interface DistrictBoundary {
    name: string;
    polygon: Polygon;
}
