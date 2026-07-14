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

const wheelchairLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    yes: { label: 'Erişilebilir', variant: 'default' },
    limited: { label: 'Kısıtlı Erişim', variant: 'secondary' },
    no: { label: 'Erişilemez', variant: 'destructive' },
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
        <Card className="flex flex-col">
            <CardHeader className="p-2 pb-1 sm:p-2.5 sm:pb-1.5">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
                        <Building2 className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                        {mosque.name}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => toggleFavorite(mosque.id)}
                        aria-label={favorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                        aria-pressed={favorite}
                    >
                        <Heart
                            className={`h-4 w-4 transition-colors ${
                                favorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                            }`}
                        />
                    </Button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-muted-foreground sm:text-[10px]">
                    <span className="flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" />
                        {formatCoordinates(mosque.lat, mosque.lon, 5)}
                    </span>
                    {distance !== undefined && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                            <Ruler className="mr-0.5 h-2.5 w-2.5" />
                            {formatDistance(distance)}
                        </Badge>
                    )}
                </div>

                {userCoords && (
                    <div className="mt-1 space-y-1">
                        <Button
                            size="sm"
                            className="w-full h-7 text-[10px] sm:w-auto px-2"
                            onClick={handleGetRoute}
                            disabled={isLoadingRoute}
                        >
                            {isLoadingRoute ? (
                                <>
                                    <div className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Yol Tarifi Hesaplanıyor...
                                </>
                            ) : route ? (
                                'Yol Tarifini Temizle'
                            ) : (
                                <>
                                    <Navigation className="mr-1.5 h-3.5 w-3.5" />
                                    Yol Tarifi Al (Haritada)
                                </>
                            )}
                        </Button>

                        {routeError && (
                            <div className="text-[11px] text-destructive flex flex-col gap-1 mt-1 p-2 border border-destructive/20 bg-destructive/5 rounded-md">
                                <span>{routeError}</span>
                                {directionsUrl && (
                                    <a
                                        href={directionsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline font-medium flex items-center gap-0.5"
                                    >
                                        Google Haritalar'da Aç <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardHeader>

            <Separator />

            <CardContent className="p-2 pt-1 sm:p-2.5 sm:pt-1.5">
                {/* Qibla Compass Visual */}
                <div className="mb-2 flex flex-col items-center justify-center p-1.5 bg-muted/20 dark:bg-muted/10 rounded-lg border border-border/50 gap-1">
                    <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider">Kıble Yönü</span>
                    <div className="relative w-11 h-11 rounded-full border border-primary/20 flex items-center justify-center bg-card shadow-xs">
                        <span className="absolute top-0.5 text-[6px] font-bold text-muted-foreground/60">K</span>
                        <span className="absolute bottom-0.5 text-[6px] font-bold text-muted-foreground/60">G</span>
                        <span className="absolute left-1 text-[6px] font-bold text-muted-foreground/60">B</span>
                        <span className="absolute right-1 text-[6px] font-bold text-muted-foreground/60">D</span>
                        <div 
                            className="w-0.5 h-7 bg-primary rounded-full transition-transform duration-500 ease-out"
                            style={{ transform: `rotate(${qiblaBearing}deg)` }}
                        />
                        <div className="absolute w-1.5 h-1.5 rounded-full bg-white border border-primary shadow-xs z-10" />
                    </div>
                    <span className="text-[9px] font-semibold text-foreground">
                        {Math.round(qiblaBearing)}° {bearingToCompass(qiblaBearing)}
                    </span>
                </div>

                <dl className="space-y-1 text-[11px] sm:text-xs">
                    {mosque.district && (
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">İlçe</dt>
                            <dd className="font-medium">{mosque.district}</dd>
                        </div>
                    )}

                    {mosque.neighborhood && (
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Mahalle</dt>
                            <dd className="font-medium">{mosque.neighborhood}</dd>
                        </div>
                    )}

                    {mosque.architect && (
                        <div className="flex justify-between">
                            <dt className="flex items-center gap-1 text-muted-foreground">
                                <User className="h-3 w-3" />
                                Mimar
                            </dt>
                            <dd className="font-medium">{mosque.architect}</dd>
                        </div>
                    )}

                    {mosque.capacity && (
                        <div className="flex justify-between">
                            <dt className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-3 w-3" />
                                Kapasite
                            </dt>
                            <dd className="font-medium">{mosque.capacity} kişi</dd>
                        </div>
                    )}

                    {wheelchairInfo && (
                        <div className="flex justify-between items-center">
                            <dt className="flex items-center gap-1 text-muted-foreground">
                                <Accessibility className="h-3 w-3" />
                                Engelli Erişimi
                            </dt>
                            <dd>
                                <Badge variant={wheelchairInfo.variant} className="text-[10px] px-1.5 py-0">
                                    {wheelchairInfo.label}
                                </Badge>
                            </dd>
                        </div>
                    )}

                    {mosque.website && (
                        <div className="flex justify-between">
                            <dt className="flex items-center gap-1 text-muted-foreground">
                                <Globe className="h-3 w-3" />
                                Website
                            </dt>
                            <dd>
                                <a
                                    href={mosque.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                    Ziyaret Et
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </dd>
                        </div>
                    )}

                    {mosque.image && (
                        <div className="flex justify-between">
                            <dt className="flex items-center gap-1 text-muted-foreground">
                                <ImageIcon className="h-3 w-3" />
                                Fotoğraf
                            </dt>
                            <dd>
                                <a
                                    href={mosque.image}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                    Görüntüle
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </dd>
                        </div>
                    )}

                    <Separator className="my-2" />

                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">OSM</dt>
                        <dd>
                            <a
                                href={mosque.osmUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                                #{mosque.id}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </dd>
                    </div>

                    {mosque.wikidata && (
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Wikidata</dt>
                            <dd>
                                <a
                                    href={`https://www.wikidata.org/wiki/${mosque.wikidata}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                    {mosque.wikidata}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </dd>
                        </div>
                    )}

                    {mosque.wikipedia && (
                        <div className="flex justify-between">
                            <dt className="flex items-center gap-1 text-muted-foreground">
                                <BookOpen className="h-3 w-3" />
                                Wikipedia
                            </dt>
                            <dd>
                                <a
                                    href={`https://tr.wikipedia.org/wiki/${mosque.wikipedia.replace(/^tr:/, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
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
