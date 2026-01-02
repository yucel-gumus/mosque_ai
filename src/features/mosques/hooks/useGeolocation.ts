import { useEffect, useState } from 'react';
import type { Coordinates } from '../types/mosque.types';
import { ISTANBUL_CENTER, GEOLOCATION_CONFIG } from '../constants/mosque.constants';

interface GeolocationState {
    coords: Coordinates | null;
    error: string | null;
    isLoading: boolean;
}

const GEOLOCATION_SUPPORTED = typeof navigator !== 'undefined' && 'geolocation' in navigator;

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

        return () => {
            isMounted = false;
        };
    }, []);

    return state;
}

