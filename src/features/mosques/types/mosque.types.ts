export interface Mosque {
    id: number;
    name: string;
    lat: number;
    lon: number;
    district?: string;
    neighborhood?: string;
    wikidata?: string;
    wikipedia?: string;
    osmUrl: string;
    architect?: string;
    image?: string;
    website?: string;
    capacity?: string;
    wheelchair?: string;
}

export type Coordinates = [number, number];

export interface GeoJSONProperties {
    '@id': string;
    name?: string;
    'name:tr'?: string;
    'addr:city'?: string;
    'addr:district'?: string;
    'addr:neighbourhood'?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:postcode'?: string;
    architect?: string;
    image?: string;
    website?: string;
    wikidata?: string;
    wikipedia?: string;
    capacity?: string;
    wheelchair?: string;
    [key: string]: string | undefined;
}

export interface GeoJSONGeometry {
    type: 'Point';
    coordinates: [number, number];
}

export interface GeoJSONFeature {
    type: 'Feature';
    id: string;
    properties: GeoJSONProperties;
    geometry: GeoJSONGeometry;
}

export interface GeoJSONFeatureCollection {
    type: 'FeatureCollection';
    generator?: string;
    copyright?: string;
    timestamp?: string;
    features: GeoJSONFeature[];
}

/** Map tile katman tanımı. */
export type TileLayerId = 'voyager' | 'satellite';

export interface MapLayer {
    id: TileLayerId;
    name: string;
    url: string;
    attribution: string;
    maxZoom: number;
}

/** Namaz vakti kayıtları. */
export interface PrayerTime {
    name: string;
    /** HH:mm formatında. */
    time: string;
}

export interface PrayerTimings {
    date: string;
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}
