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
import './MosqueMap.css';

interface MosqueMapProps {
    /** Haritada gösterilecek camiler */
    mosques: Mosque[];
    /** Seçili cami (harita bu camiye odaklanır) */
    selectedMosque: Mosque | null;
    /** Kullanıcı konumu */
    userCoords: Coordinates | null;
    /** Cami seçildiğinde çağrılır */
    onMosqueSelect: (id: number) => void;
}

/**
 * Haritayı belirtilen konuma animate eder.
 */
function FlyToLocation({ position }: { position: Coordinates }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo(position, MAP_CONFIG.FLY_TO_ZOOM, {
            duration: MAP_CONFIG.FLY_DURATION,
        });
    }, [map, position]);

    return null;
}

/**
 * İstanbul cami haritası komponenti.
 *
 * @description
 * Leaflet tabanlı interaktif harita. Camileri cluster halinde gösterir,
 * seçili camiye zoom yapar ve kullanıcı konumunu işaretler.
 */
export function MosqueMap({
    mosques,
    selectedMosque,
    userCoords,
    onMosqueSelect,
}: MosqueMapProps) {
    // Memoized ikonlar (re-render'da yeniden oluşturulmasını engelle)
    const mosqueIcon = useMemo(() => createMosqueIcon(), []);
    const userIcon = useMemo(() => createUserIcon(), []);

    // Harita sınırlarını hesapla
    const bounds = useMemo(() => {
        if (!mosques.length) return null;
        return L.latLngBounds(mosques.map((m) => [m.lat, m.lon]));
    }, [mosques]);

    // Seçili cami yoksa haritayı render etme
    if (!selectedMosque) {
        return null;
    }

    return (
        <div className="map-panel">
            <MapContainer
                className="map muted-base"
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
                    {/* Kullanıcı konum marker'ı */}
                    {userCoords && (
                        <Marker position={userCoords} icon={userIcon}>
                            <Popup>
                                <strong>Konumun</strong>
                                <br />
                                {formatCoordinates(userCoords[0], userCoords[1])}
                            </Popup>
                        </Marker>
                    )}

                    {/* Cami marker'ları */}
                    {mosques.map((mosque) => (
                        <Marker
                            key={mosque.id}
                            position={[mosque.lat, mosque.lon]}
                            icon={mosqueIcon}
                            eventHandlers={{
                                click: () => onMosqueSelect(mosque.id),
                            }}
                        >
                            <Popup className="mosque-popup">
                                <strong>{mosque.name}</strong>
                                {mosque.district && (
                                    <>
                                        <br />
                                        <span>{mosque.district}</span>
                                    </>
                                )}
                                {mosque.neighborhood && (
                                    <>
                                        <br />
                                        <span>{mosque.neighborhood}</span>
                                    </>
                                )}
                                <br />
                                <small>{formatCoordinates(mosque.lat, mosque.lon)}</small>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
}
