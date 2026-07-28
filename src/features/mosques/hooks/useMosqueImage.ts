import { useState, useEffect } from 'react';
import type { Mosque } from '../types/mosque.types';
import { getMosqueImage, type MosqueImageResult } from '../services/mosqueImage.service';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export function useMosqueImage(mosque: Mosque | null, apiKey?: string) {
    const [imageResult, setImageResult] = useState<MosqueImageResult>({
        url: null,
        source: 'Pattern',
    });
    const [isLoading, setIsLoading] = useState<boolean>(Boolean(mosque));

    const key = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const placesLib = useMapsLibrary('places');

    useEffect(() => {
        if (!mosque) {
            return;
        }

        let isMounted = true;

        getMosqueImage(mosque, key, placesLib)
            .then((res) => {
                if (isMounted) {
                    setImageResult(res);
                    setIsLoading(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setImageResult({ url: null, source: 'Pattern' });
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [mosque, key, placesLib]);

    return {
        imageUrl: mosque ? imageResult.url : null,
        source: mosque ? imageResult.source : 'Pattern',
        isLoading: mosque ? isLoading : false,
    };
}

