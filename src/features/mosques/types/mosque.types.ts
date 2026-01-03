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


export interface RawMosque {
    osm_type: string;
    osm_id: number;
    name: string;
    name_tr: string | null;
    latitude: number;
    longitude: number;
    tags: {
        [key: string]: string | undefined;
    };
}

export interface MosquesDataFile {
    metadata: {
        description: string;
        source: string;
        boundary: {
            boundary: string;
            admin_level: string;
            "ISO3166-2": string;
        };
        total_count: number;
        generated_at: string;
    };
    mosques: RawMosque[];
}
