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
export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export type Coordinates = [number, number];

