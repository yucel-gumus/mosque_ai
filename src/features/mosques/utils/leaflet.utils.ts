import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { MarkerClusterInstance } from '../types/leaflet.types';

export function setupLeafletIcons(): void {
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
    });
}

export function createMosqueIcon(isActive = false): L.DivIcon {
    return L.divIcon({
        className: `mosque-pin ${isActive ? 'selected' : ''}`,
        html: '<span class="pin-body"></span><span class="pin-dot"></span>',
        iconSize: isActive ? [48, 48] : [36, 36],
        iconAnchor: isActive ? [24, 48] : [18, 36],
        popupAnchor: [0, -28],
    });
}

export function createUserIcon(): L.DivIcon {
    return L.divIcon({
        className: 'user-pin',
        html: `
            <div class="user-marker">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
    });
}

export function createClusterIcon(cluster: MarkerClusterInstance): L.DivIcon {
    const count = cluster.getChildCount();

    return L.divIcon({
        html: `<div class="cluster-body"><span>${count}</span></div>`,
        className: 'mosque-cluster',
        iconSize: [48, 48],
    });
}
