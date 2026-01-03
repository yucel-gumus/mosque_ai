import { useCallback, useMemo, useState } from 'react';

import { useMosques, useGeolocation, useDistanceSort } from './hooks';

import { MosqueMap } from './components/MosqueMap';
import { MosqueList } from './components/MosqueList';
import { MosqueDetails } from './components/MosqueDetails';

import { StatusCard } from '../../shared/components/StatusCard';
import { Badge } from '@/components/ui/badge';

import { MapPin, Navigation } from 'lucide-react';

export function MosquesFeature() {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { mosques } = useMosques();
    const { coords: userCoords, error: geoError } = useGeolocation();

    const sortedMosques = useDistanceSort(mosques, userCoords);

    const computedSelectedId = useMemo(() => {
        if (!sortedMosques.length) return null;

        const exists = sortedMosques.some((m) => m.id === selectedId);
        if (exists && selectedId !== null) return selectedId;

        return sortedMosques[0].id;
    }, [sortedMosques, selectedId]);

    const selectedMosque = useMemo(
        () => mosques.find((m) => m.id === computedSelectedId) ?? null,
        [mosques, computedSelectedId]
    );

    const totalCount = mosques.length;

    const geoStatusMessage = useMemo(() => {
        if (!userCoords) return 'Konum belirleniyor...';
        if (geoError) return `İstanbul merkezine göre listeleniyor.`;
        return 'Konumuna göre en yakın camiler listeleniyor.';
    }, [userCoords, geoError]);

    const handleMosqueSelect = useCallback((id: number) => {
        setSelectedId(id);
    }, []);

    const hasData = totalCount > 0 && selectedMosque;
    const hasNoData = mosques.length === 0;

    return (
        <>
            {hasData && (
                <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                    <Badge variant="secondary" className="w-fit gap-1.5 px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Toplam: {totalCount} cami
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:gap-2 sm:text-sm">
                        <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>{geoStatusMessage}</span>
                    </div>
                </div>
            )}

            {hasData && (
                <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[1fr_380px] lg:gap-6 xl:grid-cols-[1fr_400px]">
                    <MosqueMap
                        mosques={mosques}
                        selectedMosque={selectedMosque}
                        userCoords={userCoords}
                        onMosqueSelect={handleMosqueSelect}
                    />

                    <div className="flex flex-col gap-3 sm:gap-4">
                        <MosqueDetails mosque={selectedMosque} />
                        <MosqueList
                            mosques={sortedMosques}
                            selectedId={computedSelectedId}
                            onSelect={handleMosqueSelect}
                        />
                    </div>
                </section>
            )}

            {hasNoData && (
                <StatusCard>
                    <p>Cami verisi bulunamadı.</p>
                </StatusCard>
            )}
        </>
    );
}
