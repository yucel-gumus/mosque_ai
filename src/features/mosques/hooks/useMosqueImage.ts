import { useState, useEffect } from 'react';
import type { Mosque } from '../types/mosque.types';
import { getMosqueImage, type MosqueImageResult } from '../services/mosqueImage.service';

/**
 * Resolves mosque photos via secure BFF image stream + Wikipedia.
 * Does not require Google Maps API key (map still uses VITE key separately).
 */
export function useMosqueImage(mosque: Mosque | null, _apiKey?: string) {
    const [imageResult, setImageResult] = useState<MosqueImageResult>({
        url: null,
        source: 'Pattern',
    });
    const [isLoading, setIsLoading] = useState<boolean>(Boolean(mosque));
    const [prevMosqueId, setPrevMosqueId] = useState<number | string | null>(mosque?.id ?? null);

    if (mosque?.id !== prevMosqueId) {
        setPrevMosqueId(mosque?.id ?? null);
        setIsLoading(Boolean(mosque));
    }

    useEffect(() => {
        if (!mosque) {
            return;
        }

        let isMounted = true;

        getMosqueImage(mosque)
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
    }, [mosque]);

    return {
        imageUrl: mosque ? imageResult.url : null,
        source: mosque ? imageResult.source : 'Pattern',
        isLoading: mosque ? isLoading : false,
    };
}
