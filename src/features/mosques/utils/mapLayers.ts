import type { GoogleMapTypeId, MapLayer } from '../types/mosque.types';

export const MAP_LAYERS: MapLayer[] = [
    {
        id: 'roadmap',
        name: 'Harita',
    },
    {
        id: 'satellite',
        name: 'Uydu',
    },
    {
        id: 'hybrid',
        name: 'Karma',
    },
    {
        id: 'terrain',
        name: 'Arazi',
    },
];

export const getLayerById = (id: GoogleMapTypeId): MapLayer =>
    MAP_LAYERS.find((l) => l.id === id) ?? MAP_LAYERS[0];
