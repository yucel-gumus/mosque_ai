import type L from 'leaflet';

export interface MarkerClusterInstance {
    getChildCount(): number;
    getAllChildMarkers(): L.Marker[];
    getBounds(): L.LatLngBounds;
    getLatLng(): L.LatLng;
}
