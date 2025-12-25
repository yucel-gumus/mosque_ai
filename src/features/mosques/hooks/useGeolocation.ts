import { useEffect, useState } from 'react';
import type { Coordinates } from '../types/mosque.types';
import { ISTANBUL_CENTER, GEOLOCATION_CONFIG } from '../constants/mosque.constants';

/**
 * Geolocation hook'unun dönüş tipi.
 */
interface GeolocationState {
    /** Kullanıcı koordinatları (veya fallback) */
    coords: Coordinates | null;
    /** Hata mesajı (varsa) */
    error: string | null;
    /** Yükleniyor durumu */
    isLoading: boolean;
}

/**
 * Kullanıcının konumunu alan custom hook.
 * Konum alınamazsa İstanbul merkezini fallback olarak kullanır.
 *
 * @returns Koordinatlar, hata ve yükleniyor durumu
 *
 * @example
 * ```tsx
 * const { coords, error, isLoading } = useGeolocation();
 *
 * if (isLoading) return <p>Konum belirleniyor...</p>;
 *
 * return <Map center={coords} />;
 * ```
 */
export function useGeolocation(): GeolocationState {
    const [state, setState] = useState<GeolocationState>({
        coords: null,
        error: null,
        isLoading: true,
    });

    useEffect(() => {
        // Tarayıcı desteği kontrolü
        if (!('geolocation' in navigator)) {
            setState({
                coords: ISTANBUL_CENTER,
                error: 'Tarayıcınız konum paylaşımını desteklemiyor.',
                isLoading: false,
            });
            return;
        }

        const handleSuccess = (position: GeolocationPosition) => {
            setState({
                coords: [position.coords.latitude, position.coords.longitude],
                error: null,
                isLoading: false,
            });
        };

        const handleError = (error: GeolocationPositionError) => {
            setState({
                coords: ISTANBUL_CENTER,
                error: error.message || 'Konum alınamadı.',
                isLoading: false,
            });
        };

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
            enableHighAccuracy: GEOLOCATION_CONFIG.ENABLE_HIGH_ACCURACY,
            timeout: GEOLOCATION_CONFIG.TIMEOUT,
        });
    }, []);

    return state;
}
