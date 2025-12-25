import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

/**
 * Leaflet varsayılan ikon ayarlarını düzeltir.
 * Vite bundler ile uyumluluk için gereklidir.
 *
 * @description Bu fonksiyon uygulama başlatılırken bir kez çağrılmalıdır.
 */
export function setupLeafletIcons(): void {
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
    });
}

/**
 * Cami marker ikonu oluşturur.
 *
 * @returns Leaflet DivIcon objesi
 */
export function createMosqueIcon(): L.DivIcon {
    return L.divIcon({
        className: 'mosque-pin',
        html: '<span class="pin-body"></span><span class="pin-dot"></span>',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -28],
    });
}

/**
 * Kullanıcı konum ikonu oluşturur.
 *
 * @returns Leaflet DivIcon objesi
 */
export function createUserIcon(): L.DivIcon {
    return L.divIcon({
        className: 'user-pin',
        html: '<span class="user-dot"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
}

/**
 * Cluster ikonu oluşturur.
 *
 * @param cluster - Leaflet MarkerCluster objesi
 * @returns Leaflet DivIcon objesi
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClusterIcon(cluster: any): L.DivIcon {
    const count = cluster.getChildCount();

    return L.divIcon({
        html: `<div class="cluster-body"><span>${count}</span></div>`,
        className: 'mosque-cluster',
        iconSize: [48, 48],
    });
}
