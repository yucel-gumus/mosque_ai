import { useEffect, useState } from 'react';
import type { Coordinates } from '../types/mosque.types';
import { ISTANBUL_CENTER, GEOLOCATION_CONFIG } from '../constants/mosque.constants';

interface GeolocationState {
    coords: Coordinates | null;
    error: string | null;
    isLoading: boolean;
}

const GEOLOCATION_SUPPORTED =
    typeof navigator !== 'undefined' && 'geolocation' in navigator;

const getInitialState = (): GeolocationState => {
    if (!GEOLOCATION_SUPPORTED) {
        return {
            coords: ISTANBUL_CENTER,
            error: 'Tarayıcınız konum paylaşımını desteklemiyor.',
            isLoading: false,
        };
    }
    return {
        coords: null,
        error: null,
        isLoading: true,
    };
};

export function useGeolocation(): GeolocationState {
    const [state, setState] = useState<GeolocationState>(getInitialState);

    useEffect(() => {
        if (!GEOLOCATION_SUPPORTED) return;

        let isMounted = true;
        let watchId: number | null = null;

        const handleSuccess = (position: GeolocationPosition) => {
            if (!isMounted) return;
            setState({
                coords: [position.coords.latitude, position.coords.longitude],
                error: null,
                isLoading: false,
            });
        };

        const handleError = (error: GeolocationPositionError) => {
            if (!isMounted) return;
            // Geolocation izni verilmediyse veya timeout olduysa İstanbul merkezine fallback yap.
            setState((prev) => ({
                coords: prev.coords ?? ISTANBUL_CENTER,
                error: error.message || 'Konum alınamadı.',
                isLoading: false,
            }));
        };

        // getCurrentPosition ve watchPosition'ı aynı anda çağırmak tarayıcılarda race condition
        // ve timeout hatalarına sebep olabildiğinden sadece watchPosition kullanıyoruz.
        watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: GEOLOCATION_CONFIG.ENABLE_HIGH_ACCURACY,
            timeout: GEOLOCATION_CONFIG.TIMEOUT,
            maximumAge: 30_000,
        });

        return () => {
            isMounted = false;
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, []);

    return state;
}
