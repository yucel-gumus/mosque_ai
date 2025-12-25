import { useCallback, useEffect, useMemo, useState } from 'react';

// Hooks
import { useMosques, useGeolocation, useDistanceSort } from './hooks';

// Components
import { MosqueMap } from './components/MosqueMap';
import { MosqueList } from './components/MosqueList';
import { MosqueDetails } from './components/MosqueDetails';

import { Filters } from './components/Filters';

// Shared
import { StatusCard } from '../../shared/components/StatusCard';

// Constants
import { DEFAULT_QUERY_BODY, LIST_LIMIT } from './constants/mosque.constants';

// Styles
import './MosquesFeature.css';

/**
 * İstanbul Camileri feature container.
 *
 * @description
 * Tüm cami feature'ının state yönetimi ve koordinasyonunu sağlar.
 * Alt komponentlere props aracılığıyla veri iletir.
 */
export function MosquesFeature() {
    // ============================
    // State
    // ============================
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [activeDistrict, setActiveDistrict] = useState('all');
    const [listLimit, setListLimit] = useState<number>(LIST_LIMIT.DEFAULT);

    // ============================
    // Custom Hooks
    // ============================
    const { mosques, status, error, refetch } = useMosques(DEFAULT_QUERY_BODY);
    const { coords: userCoords, error: geoError } = useGeolocation();

    // ============================
    // Derived State (Memoized)
    // ============================
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

    const selectedMosque = useMemo(
        () => filteredMosques.find((m) => m.id === selectedId) ?? null,
        [filteredMosques, selectedId]
    );

    // Counts
    const totalCount = mosques.length;
    const filteredCount = filteredMosques.length;
    const isTruncated = sortedMosques.length > displayedMosques.length;

    // Geo status message
    const geoStatusMessage = useMemo(() => {
        if (!userCoords) return 'Konum belirleniyor...';
        if (geoError) return `İstanbul merkezine göre listeleniyor (${geoError}).`;
        return 'Konumuna göre listeleniyor.';
    }, [userCoords, geoError]);

    // ============================
    // Effects
    // ============================

    // API başarılı olduğunda ilk camiyi seç
    useEffect(() => {
        if (status === 'success' && mosques.length > 0 && selectedId === null) {
            setSelectedId(mosques[0].id);
            setActiveDistrict('all');
        }
    }, [status, mosques, selectedId]);

    // Filtre değiştiğinde seçili camiyi güncelle
    useEffect(() => {
        if (!sortedMosques.length) {
            if (selectedId !== null) {
                setSelectedId(null);
            }
            return;
        }

        const exists = sortedMosques.some((m) => m.id === selectedId);
        if (!exists || selectedId === null) {
            setSelectedId(sortedMosques[0].id);
        }
    }, [sortedMosques, selectedId]);

    // ============================
    // Event Handlers
    // ============================

    const handleMosqueSelect = useCallback((id: number) => {
        setSelectedId(id);
    }, []);

    const handleDistrictChange = useCallback((district: string) => {
        setActiveDistrict(district);
    }, []);

    const handleListLimitChange = useCallback((limit: number) => {
        const normalized = Math.min(Math.max(Math.round(limit), LIST_LIMIT.MIN), LIST_LIMIT.MAX);
        setListLimit(normalized);
    }, []);

    const handleResetFilter = useCallback(() => {
        setActiveDistrict('all');
    }, []);

    // ============================
    // Render Helpers
    // ============================
    const isLoading = status === 'loading';
    const hasError = status === 'error';
    const hasData = status === 'success' && filteredCount > 0 && selectedMosque;
    const hasNoFiltered = status === 'success' && totalCount > 0 && filteredCount === 0;
    const hasNoData = status === 'success' && mosques.length === 0;

    // ============================
    // Render
    // ============================
    return (
        <>
            {/* Filters (sadece veri varsa göster) */}
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

            {/* Loading State */}
            {isLoading && (
                <StatusCard>
                    <p>İstanbul'daki camiler Overpass API'den çekiliyor...</p>
                </StatusCard>
            )}

            {/* Error State */}
            {hasError && (
                <StatusCard variant="error" action={{ label: 'Tekrar dene', onClick: refetch }}>
                    <p>
                        <strong>API hatası:</strong> {error}
                    </p>
                </StatusCard>
            )}

            {/* Main Content */}
            {hasData && (
                <section className="content-grid">
                    <MosqueMap
                        mosques={filteredMosques}
                        selectedMosque={selectedMosque}
                        userCoords={userCoords}
                        onMosqueSelect={handleMosqueSelect}
                    />

                    <div className="info-panel">
                        <MosqueDetails
                            mosque={selectedMosque}
                            filteredCount={filteredCount}
                            totalCount={totalCount}
                            listLimit={listLimit}
                        />

                        <MosqueList
                            mosques={displayedMosques}
                            selectedId={selectedId}
                            totalCount={sortedMosques.length}
                            isTruncated={isTruncated}
                            onSelect={handleMosqueSelect}
                        />
                    </div>
                </section>
            )}

            {/* No Filtered Results */}
            {hasNoFiltered && (
                <StatusCard action={{ label: 'Filtreyi temizle', onClick: handleResetFilter }}>
                    <p>
                        Bu ilçe için cami kaydı bulunamadı ya da veri henüz eşleşmiyor. Filtresiz
                        listeye dönüp başka bir ilçe seçebilirsiniz.
                    </p>
                </StatusCard>
            )}

            {/* No Data */}
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
