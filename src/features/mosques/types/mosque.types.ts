export interface Mosque {
    id: number;
    name: string;
    lat: number;
    lon: number;
    district?: string;
    neighborhood?: string;
    wikidata?: string;
    osmUrl: string;
}

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

export interface OverpassResponse {
    version: number;
    generator: string;
    elements: OverpassElement[];
}

export interface MosqueFilterState {
    district: string;
    listLimit: number;
}

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export type Coordinates = [number, number];

