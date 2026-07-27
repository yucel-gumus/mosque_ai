import type { Coordinates } from '../types/mosque.types';

/**
 * Google Maps stil tanımları (Daha şık ve sade görünüm için dark/light temaya uygun)
 */
export const GOOGLE_MAP_STYLES: google.maps.MapTypeStyle[] = [
    {
        featureType: 'poi',
        elementType: 'labels.text',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#dedede' }],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#a0c8d0' }],
    },
];

/**
 * Coğrafi [lat, lon] tuple'ını Google LatLngLiteral objesine çevirir.
 */
export function toLatLngLiteral(coords: Coordinates): google.maps.LatLngLiteral {
    return { lat: coords[0], lng: coords[1] };
}
