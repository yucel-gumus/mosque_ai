import { useEffect, useMemo, useState, useCallback, memo } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import type { Mosque, Coordinates } from '../../types/mosque.types';
import { MAP_CONFIG, USKUDAR_CENTER, ISTANBUL_BOUNDS } from '../../constants/mosque.constants';
import {
    calculateDistance,
    formatDistance,
    calculateQiblaBearing,
    buildDirectionsUrl,
    fetchRoute,
} from '../../utils/geo.utils';
import { calculateMosqueDensity } from '../../utils/density.utils';
import { useMosqueStore } from '../../store/mosqueStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Locate } from 'lucide-react';
import { MapLayerSwitcher } from '../MapLayerSwitcher';
import { MosqueImage } from '../MosqueImage';

const MAP_LIBRARIES: ('places' | 'marker')[] = ['places', 'marker'];


interface MosqueMapProps {
    mosques: Mosque[];
    selectedMosque: Mosque | null;
    userCoords: Coordinates | null;
    onMosqueSelect: (id: number) => void;
}

function GooglePolyline({ path }: { path: Coordinates[] }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !path || path.length < 2) return;

        const polyline = new google.maps.Polyline({
            path: path.map(([lat, lng]) => ({ lat, lng })),
            geodesic: true,
            strokeColor: '#0ea5e9',
            strokeOpacity: 0.9,
            strokeWeight: 5,
        });

        polyline.setMap(map);

        const bounds = new google.maps.LatLngBounds();
        path.forEach(([lat, lng]) => bounds.extend({ lat, lng }));
        map.fitBounds(bounds, 50);

        return () => {
            polyline.setMap(null);
        };
    }, [map, path]);

    return null;
}

function MapController({
    selectedMosque,
}: {
    selectedMosque: Mosque | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;
        if (selectedMosque) {
            map.panTo({ lat: selectedMosque.lat, lng: selectedMosque.lon });
            map.setZoom(MAP_CONFIG.FLY_TO_ZOOM);
        }
    }, [map, selectedMosque]);

    return null;
}

export const MosqueMapComponent = memo(function MosqueMapComponent({
    mosques,
    selectedMosque,
    userCoords,
    onMosqueSelect,
}: MosqueMapProps) {
    const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '');
    const [mapId, setMapId] = useState<string>(import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID');
    const [, setIsLoaded] = useState<boolean>(!!window.google?.maps);

    useEffect(() => {
        if (window.google?.maps) {
            setIsLoaded(true);
            return;
        }

        const bffBase = (import.meta.env.VITE_BFF_API_URL as string | undefined) || 
                        (import.meta.env.PROD ? 'https://pages-bff.vercel.app' : '');
        const proxyScriptUrl = `${bffBase.replace(/\/$/, '')}/api/maps/proxy/js?libraries=places,geometry`;

        const script = document.createElement('script');
        script.src = proxyScriptUrl;
        script.async = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => {
            // Fallback to config fetch if proxy script load fails
            fetch(`${bffBase}/api/maps/config`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.mapsApiKey) setApiKey(data.mapsApiKey);
                    if (data?.mapId) setMapId(data.mapId);
                    setIsLoaded(true);
                })
                .catch(() => setIsLoaded(true));
        };
        document.head.appendChild(script);
    }, []);

    const tileLayer = useMosqueStore((s) => s.ui.tileLayer);
    const route = useMosqueStore((s) => s.route);
    const setRoute = useMosqueStore((s) => s.setRoute);
    const setIsLoadingRoute = useMosqueStore((s) => s.setIsLoadingRoute);
    const setRouteError = useMosqueStore((s) => s.setRouteError);

    const [infoWindowMosque, setInfoWindowMosque] = useState<Mosque | null>(null);

    const infoWindowDensity = useMemo(
        () => (infoWindowMosque ? calculateMosqueDensity(infoWindowMosque) : null),
        [infoWindowMosque]
    );

    useEffect(() => {
        if (selectedMosque) {
            setInfoWindowMosque(selectedMosque);
        }
    }, [selectedMosque]);

    const initialCenter = useMemo(() => {
        if (selectedMosque) return { lat: selectedMosque.lat, lng: selectedMosque.lon };
        if (userCoords) return { lat: userCoords[0], lng: userCoords[1] };
        return { lat: USKUDAR_CENTER[0], lng: USKUDAR_CENTER[1] };
    }, [selectedMosque, userCoords]);

    const handleCenterOnUser = useCallback(() => {
        if (userCoords) {
            setInfoWindowMosque(null);
        }
    }, [userCoords]);

    return (
        <Card
            className="relative h-[200px] overflow-hidden sm:h-[280px] md:h-[350px] lg:h-[450px] xl:h-[500px] no-float"
            role="application"
            aria-label="İstanbul cami haritası - Google Maps"
        >
            <APIProvider apiKey={apiKey} libraries={MAP_LIBRARIES}>
                <Map
                    className="h-full w-full"
                    mapId={apiKey ? mapId : undefined}
                    defaultCenter={initialCenter}
                    defaultZoom={MAP_CONFIG.DEFAULT_ZOOM}
                    minZoom={MAP_CONFIG.MIN_ZOOM}
                    maxZoom={MAP_CONFIG.MAX_ZOOM}
                    mapTypeId={tileLayer}
                    restriction={{
                        latLngBounds: ISTANBUL_BOUNDS,
                        strictBounds: true,
                    }}
                    disableDefaultUI
                    gestureHandling="greedy"
                >
                    <MapController selectedMosque={selectedMosque} />

                    {route && route.length > 0 && <GooglePolyline path={route} />}

                    {/* Kullanıcı Konumu İşaretçisi */}
                    {userCoords && (
                        <AdvancedMarker position={{ lat: userCoords[0], lng: userCoords[1] }}>
                            <div className="user-pin">
                                <div className="user-marker">
                                    <Locate className="h-4 w-4 text-[#1A4036]" />
                                </div>
                            </div>
                        </AdvancedMarker>
                    )}

                    {/* Cami İşaretçileri */}
                    {mosques.map((mosque) => {
                        const isSelected = selectedMosque?.id === mosque.id;
                        return (
                            <AdvancedMarker
                                key={mosque.id}
                                position={{ lat: mosque.lat, lng: mosque.lon }}
                                onClick={() => {
                                    onMosqueSelect(mosque.id);
                                    setInfoWindowMosque(mosque);
                                }}
                            >
                                <div className={`mosque-pin ${isSelected ? 'selected' : ''}`}>
                                    <span className="pin-body"></span>
                                </div>
                            </AdvancedMarker>
                        );
                    })}

                    {/* Zenginleştirilmiş Cami Detay Baloncuğu (InfoWindow) */}
                    {infoWindowMosque && (
                        <InfoWindow
                            position={{ lat: infoWindowMosque.lat, lng: infoWindowMosque.lon }}
                            onCloseClick={() => setInfoWindowMosque(null)}
                        >
                            <div className="max-w-[260px] space-y-2 p-1 text-foreground">
                                {/* Google Places / Multi-Tiered Fotoğraf Önizlemesi */}
                                <MosqueImage mosque={infoWindowMosque} compact />


                                {/* Başlık & Adres */}
                                <div>
                                    <h3 className="text-sm font-extrabold text-[#4A2B20] leading-tight">
                                        {infoWindowMosque.name}
                                    </h3>
                                    <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                                        {infoWindowMosque.district ? `${infoWindowMosque.district}, ` : ''}{infoWindowMosque.neighborhood || ''}
                                    </p>
                                </div>

                                {/* Bilgi Rozetleri (Mesafe, Kıble, Kapasite) */}
                                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                                    {userCoords && (
                                        <span className="rounded-full bg-[#9BCEC1] px-2 py-0.5 font-black text-[#1A4036]">
                                            📍 {formatDistance(calculateDistance(userCoords[0], userCoords[1], infoWindowMosque.lat, infoWindowMosque.lon))}
                                        </span>
                                    )}
                                    <span className="rounded-full bg-[#FFEBD3] border border-[#FFB6A6] px-2 py-0.5 font-extrabold text-[#4A2B20]">
                                        🧭 Kıble: {Math.round(calculateQiblaBearing(infoWindowMosque.lat, infoWindowMosque.lon))}°
                                    </span>
                                    {infoWindowDensity && (
                                        <span className={`rounded-full px-2 py-0.5 font-black border text-[9px] ${infoWindowDensity.badgeClass}`}>
                                            {infoWindowDensity.label} (%{infoWindowDensity.percentage})
                                        </span>
                                    )}
                                    {infoWindowMosque.capacity && (
                                        <span className="rounded-full bg-[#FFB6A6]/40 px-2 py-0.5 font-bold text-[#4A2B20]">
                                            👥 {infoWindowMosque.capacity} kişi
                                        </span>
                                    )}
                                </div>

                                {/* Hızlı Eylem Butonları */}
                                <div className="pt-1.5 flex items-center gap-1.5">
                                    {userCoords && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setIsLoadingRoute(true);
                                                setRouteError(null);
                                                try {
                                                    const coords = await fetchRoute(userCoords, [infoWindowMosque.lat, infoWindowMosque.lon]);
                                                    setRoute(coords);
                                                } catch (err) {
                                                    setRouteError(err instanceof Error ? err.message : 'Yol tarifi alınamadı');
                                                } finally {
                                                    setIsLoadingRoute(false);
                                                }
                                            }}
                                            className="flex-1 rounded-xl bg-[#9BCEC1] px-2 py-1.5 text-[10px] font-bold text-[#1A4036] hover:bg-[#9BCEC1]/80 shadow-xs text-center transition-all cursor-pointer"
                                        >
                                            🚀 Rota Çiz
                                        </button>
                                    )}
                                    <a
                                        href={buildDirectionsUrl(
                                            userCoords ? userCoords[0] : USKUDAR_CENTER[0],
                                            userCoords ? userCoords[1] : USKUDAR_CENTER[1],
                                            infoWindowMosque.lat,
                                            infoWindowMosque.lon
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 rounded-xl bg-[#FFB6A6] px-2 py-1.5 text-[10px] font-bold text-[#4A2B20] hover:bg-[#FFB6A6]/80 shadow-xs text-center transition-all"
                                    >
                                        🗺️ Navigasyon
                                    </a>
                                </div>
                            </div>
                        </InfoWindow>
                    )}

                    <MapLayerSwitcher />
                </Map>

                {userCoords && (
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-4 right-4 z-[10] h-10 w-10 rounded-full shadow-lg"
                        onClick={handleCenterOnUser}
                        title="Konumuma dön"
                        aria-label="Konumuma dön"
                    >
                        <Locate className="h-5 w-5" />
                    </Button>
                )}
            </APIProvider>
        </Card>
    );
});

export default MosqueMapComponent;
