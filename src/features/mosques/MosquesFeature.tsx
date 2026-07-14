import { useCallback, useMemo, lazy, Suspense } from 'react';

import { useMosques, useGeolocation, useDistanceSort } from './hooks';
import { useMosqueStore } from './store/mosqueStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { normalizeText } from '../../shared/utils/text.utils';
const MosqueMap = lazy(() =>
    import('./components/MosqueMap/MosqueMap').then((m) => ({ default: m.MosqueMapComponent }))
);
import { MosqueList } from './components/MosqueList';
import { MosqueDetails } from './components/MosqueDetails';
import { FilterPanel } from './components/FilterPanel';
import { PrayerTimesPanel } from './components/PrayerTimesPanel';
import { AIAssistant } from './components/AIAssistant';

import { StatusCard } from '../../shared/components/StatusCard';
import { PerformanceProfiler } from '../../shared/components/PerformanceProfiler';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '../../shared/components/Layout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';

import { MapPin, Heart, AlertCircle } from 'lucide-react';

const MAP_FALLBACK_HEIGHT =
    'h-[200px] sm:h-[280px] md:h-[350px] lg:h-[450px] xl:h-[500px]';

export function MosquesFeature() {
    const { mosques, districts, isLoading, error } = useMosques();
    const { coords: userCoords, error: geoError } = useGeolocation();

    const { selectedId, selectMosque, searchQuery, setSearchQuery, filters } =
        useMosqueStore();

    const sortedMosques = useDistanceSort(mosques, userCoords);

    // 1) Önce filtreleri uygula
    const filteredMosques = useMemo(() => {
        return sortedMosques.filter((m) => {
            if (filters.district && m.district !== filters.district) return false;
            if (filters.wheelchairOnly && m.wheelchair !== 'yes') return false;
            if (
                filters.radius !== null &&
                userCoords &&
                (m.distance ?? Infinity) > filters.radius
            ) {
                return false;
            }
            return true;
        });
    }, [sortedMosques, filters, userCoords]);

    // 2) Arama sorgusunu uygula
    const searchedMosques = useMemo(() => {
        const q = searchQuery.trim();
        if (!q) return filteredMosques;
        
        const normalizedQuery = normalizeText(q);
        return filteredMosques.filter((m) => {
            const normalizedName = normalizeText(m.name);
            const normalizedDistrict = m.district ? normalizeText(m.district) : '';
            const normalizedNeighborhood = m.neighborhood ? normalizeText(m.neighborhood) : '';
            
            return (
                normalizedName.includes(normalizedQuery) ||
                normalizedDistrict.includes(normalizedQuery) ||
                normalizedNeighborhood.includes(normalizedQuery)
            );
        });
    }, [filteredMosques, searchQuery]);

    // 3) Seçili cami hesapla (eğer seçili yoksa veya artık listede yoksa ilkini seç)
    const computedSelectedId = useMemo(() => {
        if (!searchedMosques.length) return null;
        const exists = searchedMosques.some((m) => m.id === selectedId);
        if (exists && selectedId !== null) return selectedId;
        return null;
    }, [searchedMosques, selectedId]);

    const selectedMosque = useMemo(
        () => searchedMosques.find((m) => m.id === computedSelectedId) ?? null,
        [searchedMosques, computedSelectedId]
    );

    const totalCount = mosques.length;
    const totalAfterFilter = filteredMosques.length;

    const geoStatusMessage = useMemo(() => {
        if (!userCoords) return 'Konum belirleniyor...';
        if (geoError) return 'İstanbul merkezine göre listeleniyor.';
        return 'Konumunuza göre en yakın camiler listeleniyor.';
    }, [userCoords, geoError]);

    const handleMosqueSelect = useCallback(
        (id: number) => {
            selectMosque(id);
        },
        [selectMosque]
    );

    // Klavye kısayolları
    useKeyboardShortcuts({
        '/': () => {
            const el = document.getElementById('mosque-search') as HTMLInputElement | null;
            if (el) {
                el.focus();
                el.select();
            }
        },
        Escape: () => setSearchQuery(''),
    });

    const hasData = totalCount > 0;
    const hasNoData = !isLoading && totalCount === 0;

    return (
        <>
            <Header title="İstanbul Camileri" eyebrow="İstanbul Cami Rehberi">
                {hasData && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="font-semibold text-primary">{totalCount} Cami</span>
                        <span className="text-muted-foreground/40">•</span>
                        <span>{districts.length} İlçe</span>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            {geoStatusMessage}
                        </span>
                    </div>
                )}
            </Header>

            {hasData && (
                <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
                    <Suspense
                        fallback={
                            <Card className={MAP_FALLBACK_HEIGHT}>
                                <CardContent className="flex h-full items-center justify-center">
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        <p>Harita yükleniyor...</p>
                                    </div>
                                </CardContent>
                            </Card>
                        }
                    >
                        <ErrorBoundary
                            fallback={
                                <Card className="h-full min-h-[300px] flex items-center justify-center border-destructive/20 bg-destructive/5">
                                    <CardContent className="flex flex-col items-center justify-center p-6 text-center text-sm text-destructive gap-2">
                                        <AlertCircle className="h-6 w-6" />
                                        <span>Harita yüklenirken bir sorun oluştu. Sayfayı yenilemeyi deneyebilirsiniz.</span>
                                    </CardContent>
                                </Card>
                            }
                        >
                            <MosqueMap
                                mosques={searchedMosques}
                                selectedMosque={selectedMosque}
                                userCoords={userCoords}
                                onMosqueSelect={handleMosqueSelect}
                            />
                        </ErrorBoundary>
                    </Suspense>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                        <PerformanceProfiler id="PrayerTimes">
                            <PrayerTimesPanel
                                coords={userCoords}
                                selectedMosque={selectedMosque}
                            />
                        </PerformanceProfiler>
                        <PerformanceProfiler id="FilterPanel">
                            <FilterPanel
                                districts={districts}
                                resultCount={searchedMosques.length}
                            />
                        </PerformanceProfiler>
                        <PerformanceProfiler id="MosqueDetails">
                            {selectedMosque ? (
                                <MosqueDetails
                                    mosque={selectedMosque}
                                    userCoords={userCoords}
                                />
                            ) : searchedMosques.length > 0 ? (
                                <Card className="flex flex-col justify-center">
                                    <CardContent className="flex flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground gap-2">
                                        <MapPin className="h-6 w-6 text-primary/40" />
                                        <span>Detayları görmek için haritadan veya listeden bir cami seçin</span>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="flex flex-col justify-center">
                                    <CardContent className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                                        <Heart className="mr-2 h-4 w-4" />
                                        Filtrelere uyan cami bulunamadı
                                    </CardContent>
                                </Card>
                            )}
                        </PerformanceProfiler>
                        <PerformanceProfiler id="MosqueList">
                            <MosqueList
                                mosques={searchedMosques}
                                selectedId={computedSelectedId}
                                onSelect={handleMosqueSelect}
                                totalAfterFilter={totalAfterFilter}
                            />
                        </PerformanceProfiler>
                    </div>
                </div>
            )}

            {isLoading && (
                <StatusCard>
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p>Cami verileri yükleniyor...</p>
                    </div>
                </StatusCard>
            )}

            {error && !isLoading && (
                <StatusCard variant="error">
                    <p>Veri yüklenirken hata oluştu: {error.message}</p>
                </StatusCard>
            )}

            {!isLoading && hasNoData && (
                <StatusCard>
                    <p>Cami verisi bulunamadı.</p>
                </StatusCard>
            )}

            <AIAssistant
                selectedMosque={selectedMosque}
                userCoords={userCoords}
                closestMosques={sortedMosques.slice(0, 5)}
            />
        </>
    );
}
