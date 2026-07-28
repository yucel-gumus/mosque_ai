import { useMemo, useCallback, memo } from 'react';
import type { Mosque, Coordinates } from '../../types/mosque.types';
import type { SortedMosque } from '../../hooks/useDistanceSort';
import {
    formatCoordinates,
    formatDistance,
    calculateQiblaBearing,
    bearingToCompass,
    buildDirectionsUrl,
    fetchRoute,
} from '../../utils/geo.utils';
import { calculateMosqueDensity } from '../../utils/density.utils';
import { useMosqueStore } from '../../store/mosqueStore';
import { MosqueImage } from '../MosqueImage';

import { useShallow } from 'zustand/react/shallow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Building2,
    MapPin,
    ExternalLink,
    User,
    Globe,
    Users,
    Accessibility,
    Image as ImageIcon,
    BookOpen,
    Navigation,
    Heart,
    Ruler,
    Car,
    Activity,
} from 'lucide-react';

interface MosqueDetailsProps {
    mosque: Mosque;
    userCoords: Coordinates | null;
}

const wheelchairLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    yes: { label: 'Tekerlekli sandalye erişimine uygun', variant: 'default' },
    no: { label: 'Tekerlekli sandalye erişimine uygun değil', variant: 'outline' },
    limited: { label: 'Kısıtlı erişim', variant: 'secondary' },
};

export const MosqueDetails = memo(function MosqueDetails({ mosque, userCoords }: MosqueDetailsProps) {
    const {
        isFavorite,
        toggleFavorite,
        route,
        setRoute,
        isLoadingRoute,
        setIsLoadingRoute,
        routeError,
        setRouteError,
    } = useMosqueStore(
        useShallow((s) => ({
            isFavorite: s.isFavorite(mosque.id),
            toggleFavorite: s.toggleFavorite,
            route: s.route,
            setRoute: s.setRoute,
            isLoadingRoute: s.isLoadingRoute,
            setIsLoadingRoute: s.setIsLoadingRoute,
            routeError: s.routeError,
            setRouteError: s.setRouteError,
        }))
    );

    const sortedMosque = mosque as SortedMosque;
    const distanceMeters = sortedMosque.distance;
    const formattedDist = distanceMeters !== undefined ? formatDistance(distanceMeters) : null;

    const qiblaBearing = useMemo(
        () => calculateQiblaBearing(mosque.lat, mosque.lon),
        [mosque.lat, mosque.lon]
    );

    const density = useMemo(
        () => calculateMosqueDensity(mosque),
        [mosque]
    );

    const directionsUrl = useMemo(() => {
        if (!userCoords) return null;
        return buildDirectionsUrl(userCoords[0], userCoords[1], mosque.lat, mosque.lon);
    }, [userCoords, mosque.lat, mosque.lon]);

    const handleGetRoute = useCallback(async () => {
        if (!userCoords) return;

        if (route) {
            setRoute(null);
            setRouteError(null);
            return;
        }

        setIsLoadingRoute(true);
        setRouteError(null);

        try {
            const coords = await fetchRoute(userCoords, [mosque.lat, mosque.lon]);
            setRoute(coords);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
            setRouteError(msg);
        } finally {
            setIsLoadingRoute(false);
        }
    }, [userCoords, mosque.lat, mosque.lon, route, setRoute, setIsLoadingRoute, setRouteError]);

    const wheelchairInfo = mosque.wheelchair ? wheelchairLabels[mosque.wheelchair] : null;

    return (
        <Card className="flex flex-col rounded-3xl border-2 border-[#FFB6A6] bg-[#FFF6EC] shadow-xl overflow-hidden">
            <MosqueImage mosque={mosque} className="rounded-none rounded-t-[22px]" />

            <CardHeader className="p-3.5 pb-2 sm:p-4 sm:pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-xs font-bold text-[#4A2B20] sm:text-sm">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFB6A6] shrink-0">
                            <Building2 className="h-3.5 w-3.5 text-[#4A2B20]" />
                        </div>
                        <span className="line-clamp-2">{mosque.name}</span>
                    </CardTitle>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 rounded-full hover:bg-[#FFB6A6]/30 text-[#4A2B20]"
                        onClick={() => toggleFavorite(mosque.id)}
                        aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                    >
                        <Heart
                            className={`h-4 w-4 transition-colors ${
                                isFavorite
                                    ? 'fill-[#E06C62] text-[#E06C62]'
                                    : 'text-[#8C5E50]'
                            }`}
                        />
                    </Button>
                </div>

                {formattedDist && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-extrabold text-[#1A4036] bg-[#9BCEC1] px-2 py-0.5 rounded-full w-fit">
                        <Ruler className="h-3 w-3" />
                        <span>Mesafe: {formattedDist}</span>
                    </div>
                )}

                {/* Canlı Yoğunluk Göstergesi */}
                <div className="mt-2 p-2 rounded-2xl bg-[#FFEBD3] border border-[#FFB6A6]/60">
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-[#4A2B20]">
                        <span className="flex items-center gap-1 text-[#8C5E50]">
                            <Activity className="h-3 w-3 text-[#1A4036]" />
                            Doluluk Oranı
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] ${density.badgeClass}`}>
                            {density.label} (%{density.percentage})
                        </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full rounded-full bg-[#FFF6EC] overflow-hidden border border-[#FFB6A6]/30">
                        <div
                            className={`h-full transition-all duration-500 rounded-full ${
                                density.status === 'high'
                                    ? 'bg-[#E06C62]'
                                    : density.status === 'medium'
                                    ? 'bg-[#FFB6A6]'
                                    : 'bg-[#9BCEC1]'
                            }`}
                            style={{ width: `${density.percentage}%` }}
                        />
                    </div>
                </div>

                {userCoords && (
                    <div className="mt-2 space-y-1">
                        <Button
                            size="sm"
                            className="w-full h-8 text-xs font-bold rounded-2xl bg-[#9BCEC1] text-[#1A4036] hover:bg-[#9BCEC1]/80 shadow-md"
                            onClick={handleGetRoute}
                            disabled={isLoadingRoute}
                        >
                            {isLoadingRoute ? (
                                <>
                                    <div className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Hesaplanıyor...
                                </>
                            ) : route ? (
                                'Yol Tarifini Temizle'
                            ) : (
                                <>
                                    <Navigation className="mr-1.5 h-3.5 w-3.5" />
                                    Yol Tarifi Al (Harita)
                                </>
                            )}
                        </Button>

                        {routeError && (
                            <div className="text-[11px] font-bold text-[#E06C62] flex flex-col gap-1 mt-1 p-2 border border-[#E06C62]/30 bg-[#E06C62]/10 rounded-2xl">
                                <span>{routeError}</span>
                                {directionsUrl && (
                                    <a
                                        href={directionsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#1A4036] hover:underline font-bold flex items-center gap-0.5"
                                    >
                                        Google Haritalar'da Aç <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardHeader>

            <Separator className="bg-[#FFB6A6]/40" />

            <CardContent className="p-3.5 pt-2 sm:p-4 sm:pt-2">
                {/* Qibla Compass Visual */}
                <div className="mb-3 flex flex-col items-center justify-center p-2 bg-[#FFEBD3] rounded-2xl border border-[#FFB6A6] gap-1">
                    <span className="text-[9px] font-extrabold text-[#8C5E50] uppercase tracking-wider">Kıble Açısı</span>
                    <div className="relative w-12 h-12 rounded-full border-2 border-[#FFB6A6] flex items-center justify-center bg-[#FFF6EC] shadow-inner">
                        <span className="absolute top-0.5 text-[7px] font-black text-[#8C5E50]">K</span>
                        <span className="absolute bottom-0.5 text-[7px] font-black text-[#8C5E50]">G</span>
                        <span className="absolute left-1 text-[7px] font-black text-[#8C5E50]">B</span>
                        <span className="absolute right-1 text-[7px] font-black text-[#8C5E50]">D</span>
                        <div 
                            className="w-1 h-8 bg-[#9BCEC1] rounded-full transition-transform duration-500 ease-out"
                            style={{ transform: `rotate(${qiblaBearing}deg)` }}
                        />
                        <div className="absolute w-2 h-2 rounded-full bg-[#FFF6EC] border border-[#1A4036] shadow-xs z-10" />
                    </div>
                    <span className="text-[10px] font-black text-[#4A2B20]">
                        {Math.round(qiblaBearing)}° {bearingToCompass(qiblaBearing)}
                    </span>
                </div>

                {/* Tesis Rozetleri */}
                <div className="mb-3 flex flex-wrap gap-1">
                    <Badge className="bg-[#9BCEC1] text-[#1A4036] text-[9px] font-extrabold">
                        <Accessibility className="mr-1 h-3 w-3" /> Erişilebilir
                    </Badge>
                    <Badge className="bg-[#FFEBD3] text-[#4A2B20] border border-[#FFB6A6] text-[9px] font-extrabold">
                        <Car className="mr-1 h-3 w-3" /> Otopark Var
                    </Badge>
                    <Badge className="bg-[#FFB6A6]/40 text-[#4A2B20] text-[9px] font-extrabold">
                        <Users className="mr-1 h-3 w-3" /> Kadınlar Bölümü
                    </Badge>
                </div>

                <dl className="space-y-1.5 text-xs font-medium text-[#4A2B20]">
                    {mosque.district && (
                        <div className="flex justify-between border-b border-[#FFB6A6]/20 pb-1">
                            <dt className="text-[#8C5E50] font-semibold">İlçe</dt>
                            <dd className="font-bold">{mosque.district}</dd>
                        </div>
                    )}

                    {mosque.neighborhood && (
                        <div className="flex justify-between border-b border-[#FFB6A6]/20 pb-1">
                            <dt className="text-[#8C5E50] font-semibold">Mahalle</dt>
                            <dd className="font-bold">{mosque.neighborhood}</dd>
                        </div>
                    )}

                    {mosque.architect && (
                        <div className="flex justify-between border-b border-[#FFB6A6]/20 pb-1">
                            <dt className="flex items-center gap-1 text-[#8C5E50] font-semibold">
                                <User className="h-3.5 w-3.5" />
                                Mimar
                            </dt>
                            <dd className="font-bold">{mosque.architect}</dd>
                        </div>
                    )}

                    {mosque.capacity && (
                        <div className="flex justify-between border-b border-[#FFB6A6]/20 pb-1">
                            <dt className="flex items-center gap-1 text-[#8C5E50] font-semibold">
                                <Users className="h-3.5 w-3.5" />
                                Kapasite
                            </dt>
                            <dd className="font-bold">{mosque.capacity} kişi</dd>
                        </div>
                    )}

                    {wheelchairInfo && (
                        <div className="flex justify-between border-b border-[#FFB6A6]/20 pb-1">
                            <dt className="flex items-center gap-1 text-[#8C5E50] font-semibold">
                                <Accessibility className="h-3.5 w-3.5" />
                                Engelli Erişimi
                            </dt>
                            <dd className="font-bold">
                                <Badge variant={wheelchairInfo.variant} className="text-[10px]">
                                    {wheelchairInfo.label}
                                </Badge>
                            </dd>
                        </div>
                    )}

                    <div className="flex justify-between pt-1">
                        <dt className="flex items-center gap-1 text-[#8C5E50] font-semibold">
                            <MapPin className="h-3.5 w-3.5" />
                            Koordinat
                        </dt>
                        <dd className="font-mono text-[11px] font-bold">
                            {formatCoordinates(mosque.lat, mosque.lon)}
                        </dd>
                    </div>
                </dl>

                {/* Dış Bağlantılar */}
                <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-[#FFB6A6]/40">
                    <a
                        href={mosque.osmUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1A4036] hover:underline"
                    >
                        <ExternalLink className="h-3 w-3" />
                        OSM Kaydı
                    </a>

                    {mosque.website && (
                        <a
                            href={mosque.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1A4036] hover:underline"
                        >
                            <Globe className="h-3 w-3" />
                            Web Sitesi
                        </a>
                    )}

                    {mosque.wikidata && (
                        <a
                            href={`https://www.wikidata.org/wiki/${mosque.wikidata}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1A4036] hover:underline"
                        >
                            <BookOpen className="h-3 w-3" />
                            Wikidata
                        </a>
                    )}

                    {mosque.wikipedia && (
                        <a
                            href={`https://tr.wikipedia.org/wiki/${mosque.wikipedia}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1A4036] hover:underline"
                        >
                            <BookOpen className="h-3 w-3" />
                            Wikipedia
                        </a>
                    )}

                    {mosque.image && (
                        <a
                            href={mosque.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1A4036] hover:underline"
                        >
                            <ImageIcon className="h-3 w-3" />
                            Görsel
                        </a>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});
