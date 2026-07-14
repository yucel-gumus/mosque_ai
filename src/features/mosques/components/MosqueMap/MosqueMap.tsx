import { useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, Polyline } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { Mosque, Coordinates } from '../../types/mosque.types';
import { MAP_CONFIG, ISTANBUL_CENTER } from '../../constants/mosque.constants';
import {
    createMosqueIcon,
    createUserIcon,
    createClusterIcon,
} from '../../utils/leaflet.utils';
import { formatCoordinates } from '../../utils/geo.utils';
import { getLayerById } from '../../utils/mapLayers';
import { useMosqueStore } from '../../store/mosqueStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Locate } from 'lucide-react';
import { MapLayerSwitcher } from '../MapLayerSwitcher';

interface MosqueMapProps {
    mosques: Mosque[];
    selectedMosque: Mosque | null;
    userCoords: Coordinates | null;
    onMosqueSelect: (id: number) => void;
}

function FlyToLocation({ position }: { position: Coordinates }) {
    const map = useMap();

    useEffect(() => {
        const currentZoom = map.getZoom();
        const targetZoom = Math.max(currentZoom, MAP_CONFIG.FLY_TO_ZOOM);
        map.flyTo(position, targetZoom, { duration: MAP_CONFIG.FLY_DURATION });
    }, [map, position]);

    return null;
}

function FitRouteBounds({ route }: { route: Coordinates[] | null }) {
    const map = useMap();

    useEffect(() => {
        if (route && route.length > 0) {
            const bounds = L.latLngBounds(route);
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    }, [map, route]);

    return null;
}

function MapController({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
    const map = useMap();
    useEffect(() => {
        onMapReady(map);
    }, [map, onMapReady]);
    return null;
}

export const MosqueMapComponent = memo(function MosqueMapComponent({
    mosques,
    selectedMosque,
    userCoords,
    onMosqueSelect,
}: MosqueMapProps) {
    const defaultMosqueIcon = useMemo(() => createMosqueIcon(false), []);
    const selectedMosqueIcon = useMemo(() => createMosqueIcon(true), []);
    const userIcon = useMemo(() => createUserIcon(), []);
    const mapRef = useRef<L.Map | null>(null);
    const tileLayer = useMosqueStore((s) => s.ui.tileLayer);
    const route = useMosqueStore((s) => s.route);

    const currentLayer = useMemo(() => getLayerById(tileLayer), [tileLayer]);

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



    return (
        <Card
            className="relative h-[200px] overflow-hidden sm:h-[280px] md:h-[350px] lg:h-[450px] xl:h-[500px] no-float"
            role="application"
            aria-label="İstanbul cami haritası - haritada gezinmek için ok tuşlarını kullanın"
        >
            <MapContainer
                className="h-full w-full"
                center={selectedMosque ? [selectedMosque.lat, selectedMosque.lon] : (userCoords ?? ISTANBUL_CENTER)}
                bounds={bounds ?? undefined}
                scrollWheelZoom
                zoom={MAP_CONFIG.DEFAULT_ZOOM}
                minZoom={MAP_CONFIG.MIN_ZOOM}
                maxZoom={MAP_CONFIG.MAX_ZOOM}
                preferCanvas
                attributionControl={false}
            >
                <TileLayer
                    key={tileLayer}
                    attribution={currentLayer.attribution}
                    url={currentLayer.url}
                    maxZoom={currentLayer.maxZoom}
                />
                <MapController onMapReady={handleMapReady} />
                {!route && selectedMosque && <FlyToLocation position={[selectedMosque.lat, selectedMosque.lon]} />}

                {route && route.length > 0 && (
                    <>
                        <Polyline
                            positions={route}
                            color="#0ea5e9"
                            weight={5}
                            opacity={0.8}
                            lineJoin="round"
                        />
                        <FitRouteBounds route={route} />
                    </>
                )}

                {userCoords && (
                    <Marker position={userCoords} icon={userIcon} zIndexOffset={1000}>
                        <Popup>
                            <div className="space-y-1 text-center">
                                <h3 className="text-sm font-semibold text-foreground">📍 Konumunuz</h3>
                                <p className="font-mono text-xs text-muted-foreground">
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
                    disableClusteringAtZoom={18}
                    maxClusterRadius={40}
                    polygonOptions={{ color: '#4338ca', weight: 1, opacity: 0.6 }}
                >
                    {mosques.map((mosque) => {
                        const isSelected = selectedMosque ? selectedMosque.id === mosque.id : false;
                        return (
                            <Marker
                                key={mosque.id}
                                position={[mosque.lat, mosque.lon]}
                                icon={isSelected ? selectedMosqueIcon : defaultMosqueIcon}
                                zIndexOffset={isSelected ? 1000 : 0}
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
                                                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                                    {formatCoordinates(mosque.lat, mosque.lon)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MarkerClusterGroup>
            </MapContainer>

            <MapLayerSwitcher />

            {userCoords && (
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-4 right-4 z-[1000] h-10 w-10 rounded-full shadow-lg"
                    onClick={handleCenterOnUser}
                    title="Konumuma dön"
                    aria-label="Konumuma dön"
                >
                    <Locate className="h-5 w-5" />
                </Button>
            )}
        </Card>
    );
});

export default MosqueMapComponent;
