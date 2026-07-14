import type { TileLayerId, MapLayer } from '../types/mosque.types';

export const MAP_LAYERS: MapLayer[] = [
    {
        id: 'voyager',
        name: 'Açık',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
    },
    {
        id: 'dark',
        name: 'Karanlık',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
    },
    {
        id: 'satellite',
        name: 'Uydu',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
    },
];

export const getLayerById = (id: TileLayerId): MapLayer =>
    MAP_LAYERS.find((l) => l.id === id) ?? MAP_LAYERS[0];
