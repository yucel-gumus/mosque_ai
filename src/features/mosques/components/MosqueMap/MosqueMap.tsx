import { useEffect, useMemo } from 'react';
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

export function MosqueMap({
    mosques,
    selectedMosque,
    userCoords,
    onMosqueSelect,
}: MosqueMapProps) {
    const mosqueIcon = useMemo(() => createMosqueIcon(), []);
    const userIcon = useMemo(() => createUserIcon(), []);

    const bounds = useMemo(() => {
        if (!mosques.length) return null;
        return L.latLngBounds(mosques.map((m) => [m.lat, m.lon]));
    }, [mosques]);

    if (!selectedMosque) {
        return null;
    }

    return (
        <Card
            className="relative h-[500px] overflow-hidden lg:h-auto"
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
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FlyToLocation position={[selectedMosque.lat, selectedMosque.lon]} />

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterIcon}
                    spiderfyOnMaxZoom
                    showCoverageOnHover={false}
                    polygonOptions={{ color: '#4338ca', weight: 1, opacity: 0.6 }}
                >
                    {userCoords && (
                        <Marker position={userCoords} icon={userIcon}>
                            <Popup>
                                <strong className="text-foreground">Konumun</strong>
                                <br />
                                <span className="text-muted-foreground text-xs">
                                    {formatCoordinates(userCoords[0], userCoords[1])}
                                </span>
                            </Popup>
                        </Marker>
                    )}

                    {mosques.map((mosque) => (
                        <Marker
                            key={mosque.id}
                            position={[mosque.lat, mosque.lon]}
                            icon={mosqueIcon}
                            eventHandlers={{
                                click: () => onMosqueSelect(mosque.id),
                            }}
                        >
                            <Popup>
                                <strong className="text-foreground">{mosque.name}</strong>
                                {mosque.district && (
                                    <>
                                        <br />
                                        <span className="text-muted-foreground">{mosque.district}</span>
                                    </>
                                )}
                                {mosque.neighborhood && (
                                    <>
                                        <br />
                                        <span className="text-muted-foreground text-xs">{mosque.neighborhood}</span>
                                    </>
                                )}
                                <br />
                                <small className="text-muted-foreground">
                                    {formatCoordinates(mosque.lat, mosque.lon)}
                                </small>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </Card>
    );
}
