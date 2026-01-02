import { useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { Mosque, Coordinates } from '../../types/mosque.types';
import { ISTANBUL_BOUNDS, MAP_CONFIG } from '../../constants/mosque.constants';
import {
    createMosqueIcon,
    createUserIcon,
    createClusterIcon,
} from '../../utils/leaflet.utils';
import { formatCoordinates } from '../../utils/geo.utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Locate } from 'lucide-react';

interface MosqueMapProps {
    mosques: Mosque[];
    selectedMosque: Mosque | null;
    userCoords: Coordinates | null;
    onMosqueSelect: (id: number) => void;
}

function FlyToLocation({ position }: { position: Coordinates }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo(position, MAP_CONFIG.FLY_TO_ZOOM, {
            duration: MAP_CONFIG.FLY_DURATION,
        });
    }, [map, position]);

    return null;
}

function MapController({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
    const map = useMap();

    useEffect(() => {
        onMapReady(map);
    }, [map, onMapReady]);

    return null;
}

export function MosqueMap({
    mosques,
    selectedMosque,
    userCoords,
    onMosqueSelect,
}: MosqueMapProps) {
    // Memoize base icons to avoid re-creation
    const defaultMosqueIcon = useMemo(() => createMosqueIcon(false), []);
    const selectedMosqueIcon = useMemo(() => createMosqueIcon(true), []);
    const userIcon = useMemo(() => createUserIcon(), []);
    const mapRef = useRef<L.Map | null>(null);

    const bounds = useMemo(() => {
        if (!mosques.length) return null;
        return L.latLngBounds(mosques.map((m) => [m.lat, m.lon]));
    }, [mosques]);

    const handleMapReady = useCallback((map: L.Map) => {
        mapRef.current = map;
    }, []);

    const handleCenterOnUser = useCallback(() => {
        if (mapRef.current && userCoords) {
            mapRef.current.flyTo(userCoords, MAP_CONFIG.FLY_TO_ZOOM, {
                duration: MAP_CONFIG.FLY_DURATION,
            });
        }
    }, [userCoords]);

    if (!selectedMosque) {
        return null;
    }

    return (
        <Card
            className="relative h-[500px] overflow-hidden lg:h-auto lg:min-h-[600px]"
            role="application"
            aria-label="İstanbul cami haritası - haritada gezinmek için ok tuşlarını kullanın"
        >
            <MapContainer
                className="h-full w-full"
                center={[selectedMosque.lat, selectedMosque.lon]}
                bounds={bounds ?? undefined}
                scrollWheelZoom
                zoom={MAP_CONFIG.DEFAULT_ZOOM}
                maxBounds={ISTANBUL_BOUNDS}
                maxBoundsViscosity={1}
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <MapController onMapReady={handleMapReady} />
                <FlyToLocation position={[selectedMosque.lat, selectedMosque.lon]} />

                {userCoords && (
                    <Marker position={userCoords} icon={userIcon} zIndexOffset={1000}>
                        <Popup>
                            <div className="space-y-1 text-center">
                                <h3 className="text-sm font-semibold text-foreground">📍 Konumunuz</h3>
                                <p className="text-xs text-muted-foreground font-mono">
                                    {formatCoordinates(userCoords[0], userCoords[1])}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterIcon}
                    spiderfyOnMaxZoom
                    showCoverageOnHover={false}
                    polygonOptions={{ color: '#4338ca', weight: 1, opacity: 0.6 }}
                >
                    {mosques.map((mosque) => (
                        <Marker
                            key={mosque.id}
                            position={[mosque.lat, mosque.lon]}
                            icon={selectedMosque?.id === mosque.id ? selectedMosqueIcon : defaultMosqueIcon}
                            zIndexOffset={selectedMosque?.id === mosque.id ? 1000 : 0}
                            eventHandlers={{
                                click: () => onMosqueSelect(mosque.id),
                            }}
                        >
                            <Popup>
                                <div className="space-y-2">
                                    <h3 className="text-base font-semibold leading-none tracking-tight text-foreground">
                                        {mosque.name}
                                    </h3>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        {mosque.district && (
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-medium text-foreground">{mosque.district}</span>
                                            </div>
                                        )}
                                        {mosque.neighborhood && (
                                            <div className="text-xs">{mosque.neighborhood}</div>
                                        )}
                                        <div className="flex items-center gap-1.5 pt-1 text-xs">
                                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                                {formatCoordinates(mosque.lat, mosque.lon)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            {userCoords && (
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-4 right-4 z-[1000] h-10 w-10 rounded-full shadow-lg"
                    onClick={handleCenterOnUser}
                    title="Konumuma dön"
                >
                    <Locate className="h-5 w-5" />
                </Button>
            )}
        </Card>
    );
}

