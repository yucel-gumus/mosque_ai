import { useCallback, useEffect, useState } from 'react';
import type { Mosque, FetchStatus } from '../types/mosque.types';
import { fetchMosques } from '../api/overpassApi';

/**
 * useMosques hook'unun dönüş tipi.
 */
interface UseMosquesResult {
    /** Çekilen cami listesi */
    mosques: Mosque[];
    /** API çağrı durumu */
    status: FetchStatus;
    /** Hata mesajı (varsa) */
    error: string | null;
    /** Verileri yeniden çekme fonksiyonu */
    refetch: () => void;
}

/**
 * Cami verilerini Overpass API'den çeken custom hook.
 *
 * @param queryBody - Overpass sorgu gövdesi
 * @returns Cami listesi, durum, hata ve yenileme fonksiyonu
 *
 * @example
 * ```tsx
 * const { mosques, status, error, refetch } = useMosques(DEFAULT_QUERY_BODY);
 *
 * if (status === 'loading') return <LoadingSpinner />;
 * if (status === 'error') return <ErrorCard message={error} onRetry={refetch} />;
 *
 * return <MosqueList mosques={mosques} />;
 * ```
 */
export function useMosques(queryBody: string): UseMosquesResult {
    const [mosques, setMosques] = useState<Mosque[]>([]);
    const [status, setStatus] = useState<FetchStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const refetch = useCallback(() => {
        setReloadToken((token) => token + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadMosques = async () => {
            setStatus('loading');
            setError(null);

            try {
                const data = await fetchMosques(queryBody);

                if (!cancelled) {
                    setMosques(data);
                    setStatus('success');
                }
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
                    setError(message);
                    setMosques([]);
                    setStatus('error');
                }
            }
        };

        void loadMosques();

        return () => {
            cancelled = true;
        };
    }, [queryBody, reloadToken]);

    return { mosques, status, error, refetch };
}
