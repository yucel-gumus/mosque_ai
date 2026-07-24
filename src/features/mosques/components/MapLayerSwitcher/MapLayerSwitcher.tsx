import { useMosqueStore } from '../../store/mosqueStore';
import { MAP_LAYERS } from '../../utils/mapLayers';
import { cn } from '@/lib/utils';
import { Map, Satellite } from 'lucide-react';
import type { TileLayerId } from '../../types/mosque.types';

const ICONS: Record<TileLayerId, typeof Map> = {
    voyager: Map,
    satellite: Satellite,
};

export function MapLayerSwitcher() {
    const tileLayer = useMosqueStore((s) => s.ui.tileLayer);
    const setTileLayer = useMosqueStore((s) => s.setTileLayer);

    return (
        <div className="absolute right-3 top-3 z-[1000] flex gap-1 rounded-full border-2 border-[#FFB6A6] bg-[#FFF6EC] p-1 shadow-xl">
            {MAP_LAYERS.map((layer) => {
                const Icon = ICONS[layer.id];
                const active = tileLayer === layer.id;
                return (
                    <button
                        key={layer.id}
                        type="button"
                        onClick={() => setTileLayer(layer.id)}
                        className={cn(
                            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all sm:px-3 sm:text-xs',
                            active
                                ? 'bg-[#9BCEC1] text-[#1A4036] shadow-sm scale-105'
                                : 'text-[#4A2B20] hover:bg-[#FFB6A6]/30'
                        )}
                        title={layer.name}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{layer.name}</span>
                    </button>
                );
            })}
        </div>
    );
}
