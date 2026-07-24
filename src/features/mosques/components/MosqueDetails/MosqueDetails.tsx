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
import { useMosqueStore } from '../../store/mosqueStore';
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
    Ruler
} from 'lucide-react';

interface MosqueDetailsProps {
    mosque: Mosque | SortedMosque;
    userCoords: Coordinates | null;
}

const wheelchairLabels: Record<string, { label: string; bgClass: string }> = {
    yes: { label: 'Erişilebilir', bgClass: 'bg-[#9BCEC1] text-[#1A4036]' },
    limited: { label: 'Kısıtlı Erişim', bgClass: 'bg-[#FFB6A6] text-[#4A2B20]' },
    no: { label: 'Erişilemez', bgClass: 'bg-[#E06C62] text-[#FFF6EC]' },
};

export const MosqueDetails = memo(function MosqueDetails({ mosque, userCoords }: MosqueDetailsProps) {
    const favorites = useMosqueStore((s) => s.favorites);
    const toggleFavorite = useMosqueStore((s) => s.toggleFavorite);
    const favorite = useMemo(() => favorites.includes(mosque.id), [favorites, mosque.id]);

    const distance = (mosque as SortedMosque).distance;
    const qiblaBearing = useMemo(
        () => calculateQiblaBearing(mosque.lat, mosque.lon),
        [mosque.lat, mosque.lon]
    );

    const directionsUrl = useMemo(() => {
        if (!userCoords) return null;
        return buildDirectionsUrl(
            userCoords[0],
            userCoords[1],
            mosque.lat,
            mosque.lon
        );
    }, [userCoords, mosque.lat, mosque.lon]);

    const {
        route,
        setRoute,
        isLoadingRoute,
        setIsLoadingRoute,
        routeError,
        setRouteError,
    } = useMosqueStore(
        useShallow((s) => ({
            route: s.route,
            setRoute: s.setRoute,
            isLoadingRoute: s.isLoadingRoute,
            setIsLoadingRoute: s.setIsLoadingRoute,
            routeError: s.routeError,
            setRouteError: s.setRouteError,
        }))
    );

    const handleGetRoute = useCallback(async () => {
        if (route) {
            setRoute(null);
            setRouteError(null);
            return;
        }
        if (!userCoords) return;
        setIsLoadingRoute(true);
        setRouteError(null);
        try {
            const coords = await fetchRoute(userCoords, [mosque.lat, mosque.lon]);
            setRoute(coords);
        } catch (err) {
            console.error(err);
            setRouteError(err instanceof Error ? err.message : 'Yol tarifi yüklenemedi.');
        } finally {
            setIsLoadingRoute(false);
        }
    }, [route, userCoords, mosque.lat, mosque.lon, setRoute, setRouteError, setIsLoadingRoute]);

    const wheelchairInfo = mosque.wheelchair ? wheelchairLabels[mosque.wheelchair] : null;

    return (
        <Card className="flex flex-col rounded-3xl border-2 border-[#FFB6A6] bg-[#FFF6EC] shadow-xl">
            <CardHeader className="p-3.5 pb-2 sm:p-4 sm:pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-xs font-bold text-[#4A2B20] sm:text-sm">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFB6A6] text-[#4A2B20]">
                            <Building2 className="h-4 w-4" />
                        </div>
                        <span className="truncate">{mosque.name}</span>
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full hover:bg-[#FFB6A6]/30"
                        onClick={() => toggleFavorite(mosque.id)}
                        aria-label={favorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                        aria-pressed={favorite}
                    >
                        <Heart
                            className={`h-4 w-4 transition-colors ${
                                favorite ? 'fill-[#E06C62] text-[#E06C62]' : 'text-[#8C5E50]'
                            }`}
                        />
                    </Button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-[#8C5E50]">
                    <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3 text-[#4A2B20]" />
                        {formatCoordinates(mosque.lat, mosque.lon, 5)}
                    </span>
                    {distance !== undefined && (
                        <Badge className="bg-[#9BCEC1] text-[#1A4036] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#7CB8AA]">
                            <Ruler className="mr-0.5 h-3 w-3" />
                            {formatDistance(distance)}
                        </Badge>
                    )}
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
                        <div className="flex justify-between items-center border-b border-[#FFB6A6]/20 pb-1">
                            <dt className="flex items-center gap-1 text-[#8C5E50] font-semibold">
                                <Accessibility className="h-3.5 w-3.5" />
                                Engelli Erişimi
                            </dt>
                            <dd>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${wheelchairInfo.bgClass}`}>
                                    {wheelchairInfo.label}
                                </span>
                            </dd>
                        </div>
                    )}

                    {mosque.website && (
                        <div className="flex justify-between border-b border-[#FFB6A6]/20 pb-1">
                            <dt className="flex items-center gap-1 text-[#8C5E50] font-semibold">
                                <Globe className="h-3.5 w-3.5" />
                                Website
                            </dt>
                            <dd>
                                <a
                                    href={mosque.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-bold text-[#1A4036] hover:underline"
                                >
                                    Ziyaret Et
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </dd>
                        </div>
                    )}

                    {mosque.image && (
                        <div className="flex justify-between border-b border-[#FFB6A6]/20 pb-1">
                            <dt className="flex items-center gap-1 text-[#8C5E50] font-semibold">
                                <ImageIcon className="h-3.5 w-3.5" />
                                Fotoğraf
                            </dt>
                            <dd>
                                <a
                                    href={mosque.image}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-bold text-[#1A4036] hover:underline"
                                >
                                    Görüntüle
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </dd>
                        </div>
                    )}

                    <div className="flex justify-between border-b border-[#FFB6A6]/20 pb-1 pt-1">
                        <dt className="text-[#8C5E50] font-semibold">OSM</dt>
                        <dd>
                            <a
                                href={mosque.osmUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-[#1A4036] hover:underline"
                            >
                                #{mosque.id}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </dd>
                    </div>

                    {mosque.wikidata && (
                        <div className="flex justify-between border-b border-[#FFB6A6]/20 pb-1">
                            <dt className="text-[#8C5E50] font-semibold">Wikidata</dt>
                            <dd>
                                <a
                                    href={`https://www.wikidata.org/wiki/${mosque.wikidata}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-bold text-[#1A4036] hover:underline"
                                >
                                    {mosque.wikidata}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </dd>
                        </div>
                    )}

                    {mosque.wikipedia && (
                        <div className="flex justify-between">
                            <dt className="flex items-center gap-1 text-[#8C5E50] font-semibold">
                                <BookOpen className="h-3.5 w-3.5" />
                                Wikipedia
                            </dt>
                            <dd>
                                <a
                                    href={`https://tr.wikipedia.org/wiki/${mosque.wikipedia.replace(/^tr:/, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-bold text-[#1A4036] hover:underline"
                                >
                                    Makale
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </dd>
                        </div>
                    )}
                </dl>
            </CardContent>
        </Card>
    );
});
