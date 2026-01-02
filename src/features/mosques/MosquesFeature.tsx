import { useCallback, useMemo, useState } from 'react';

import { useMosques, useGeolocation, useDistanceSort } from './hooks';

import { MosqueMap } from './components/MosqueMap';
import { MosqueList } from './components/MosqueList';
import { MosqueDetails } from './components/MosqueDetails';

import { Filters } from './components/Filters';

import { StatusCard } from '../../shared/components/StatusCard';
import { Skeleton } from '@/components/ui/skeleton';

import { DEFAULT_QUERY_BODY, LIST_LIMIT } from './constants/mosque.constants';

export function MosquesFeature() {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [activeDistrict, setActiveDistrict] = useState('all');
    const [listLimit, setListLimit] = useState<number>(LIST_LIMIT.DEFAULT);

    const { mosques, status, error, refetch } = useMosques(DEFAULT_QUERY_BODY);
    const { coords: userCoords, error: geoError } = useGeolocation();

    const districtOptions = useMemo(() => {
        const districts = new Set<string>();
        mosques.forEach((mosque) => {
            if (mosque.district) {
                districts.add(mosque.district);
            }
        });
        return Array.from(districts).sort((a, b) => a.localeCompare(b, 'tr'));
    }, [mosques]);

    const filteredMosques = useMemo(() => {
        if (activeDistrict === 'all') return mosques;
        return mosques.filter((mosque) => mosque.district === activeDistrict);
    }, [mosques, activeDistrict]);

    const sortedMosques = useDistanceSort(filteredMosques, userCoords);

    const displayedMosques = useMemo(
        () => sortedMosques.slice(0, listLimit),
        [sortedMosques, listLimit]
    );

    const computedSelectedId = useMemo(() => {
        if (!sortedMosques.length) return null;

        const exists = sortedMosques.some((m) => m.id === selectedId);
        if (exists && selectedId !== null) return selectedId;

        return sortedMosques[0].id;
    }, [sortedMosques, selectedId]);

    const selectedMosque = useMemo(
        () => filteredMosques.find((m) => m.id === computedSelectedId) ?? null,
        [filteredMosques, computedSelectedId]
    );

    const totalCount = mosques.length;
    const filteredCount = filteredMosques.length;
    const isTruncated = sortedMosques.length > displayedMosques.length;

    const geoStatusMessage = useMemo(() => {
        if (!userCoords) return 'Konum belirleniyor...';
        if (geoError) return `İstanbul merkezine göre listeleniyor (${geoError}).`;
        return 'Konumuna göre listeleniyor.';
    }, [userCoords, geoError]);

    const handleMosqueSelect = useCallback((id: number) => {
        setSelectedId(id);
    }, []);

    const handleDistrictChange = useCallback((district: string) => {
        setActiveDistrict(district);
        setSelectedId(null);
    }, []);

    const handleListLimitChange = useCallback((limit: number) => {
        const normalized = Math.min(Math.max(Math.round(limit), LIST_LIMIT.MIN), LIST_LIMIT.MAX);
        setListLimit(normalized);
    }, []);

    const handleResetFilter = useCallback(() => {
        setActiveDistrict('all');
        setSelectedId(null);
    }, []);

    const isLoading = status === 'loading' || status === 'idle';
    const hasError = status === 'error';
    const hasData = status === 'success' && filteredCount > 0 && selectedMosque;
    const hasNoFiltered = status === 'success' && totalCount > 0 && filteredCount === 0;
    const hasNoData = status === 'success' && mosques.length === 0;

    return (
        <>
            {!isLoading && !hasError && districtOptions.length > 0 && (
                <Filters
                    activeDistrict={activeDistrict}
                    districtOptions={districtOptions}
                    totalCount={totalCount}
                    filteredCount={filteredCount}
                    displayedCount={displayedMosques.length}
                    listLimit={listLimit}
                    geoStatusMessage={geoStatusMessage}
                    onDistrictChange={handleDistrictChange}
                    onListLimitChange={handleListLimitChange}
                    onResetFilter={handleResetFilter}
                />
            )}

            {isLoading && (
                <div className="space-y-4 py-8">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                        <Skeleton className="h-[500px] rounded-xl" />
                        <div className="space-y-4">
                            <Skeleton className="h-32 rounded-xl" />
                            <Skeleton className="h-64 rounded-xl" />
                        </div>
                    </div>
                </div>
            )}

            {hasError && (
                <StatusCard variant="error" action={{ label: 'Tekrar dene', onClick: refetch }}>
                    <p>
                        <strong>API hatası:</strong> {error}
                    </p>
                </StatusCard>
            )}

            {hasData && (
                <section className="grid gap-6 lg:grid-cols-[1fr_400px]">
                    <MosqueMap
                        mosques={filteredMosques}
                        selectedMosque={selectedMosque}
                        userCoords={userCoords}
                        onMosqueSelect={handleMosqueSelect}
                    />

                    <div className="flex flex-col gap-4">
                        <MosqueDetails
                            mosque={selectedMosque}
                            filteredCount={filteredCount}
                            totalCount={totalCount}
                            listLimit={listLimit}
                        />

                        <MosqueList
                            mosques={displayedMosques}
                            selectedId={computedSelectedId}
                            totalCount={sortedMosques.length}
                            isTruncated={isTruncated}
                            onSelect={handleMosqueSelect}
                        />
                    </div>
                </section>
            )}

            {hasNoFiltered && (
                <StatusCard action={{ label: 'Filtreyi temizle', onClick: handleResetFilter }}>
                    <p>
                        Bu ilçe için cami kaydı bulunamadı ya da veri henüz eşleşmiyor. Filtresiz
                        listeye dönüp başka bir ilçe seçebilirsiniz.
                    </p>
                </StatusCard>
            )}

            {hasNoData && (
                <StatusCard action={{ label: 'Verileri yenile', onClick: refetch }}>
                    <p>
                        İstanbul sınırları için veri getirilemedi. İnternet bağlantınızı kontrol
                        edin veya sorguyu düzenleyip tekrar deneyin.
                    </p>
                </StatusCard>
            )}
        </>
    );
}


