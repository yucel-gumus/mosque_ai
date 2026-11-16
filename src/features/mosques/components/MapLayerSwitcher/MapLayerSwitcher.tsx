import { useMosqueStore } from '../../store/mosqueStore';
import { MAP_LAYERS } from '../../utils/mapLayers';
import { cn } from '@/lib/utils';
import { Map, Satellite, Layers, Mountain } from 'lucide-react';
import type { GoogleMapTypeId } from '../../types/mosque.types';

const ICONS: Record<GoogleMapTypeId, typeof Map> = {
    roadmap: Map,
    satellite: Satellite,
    hybrid: Layers,
    terrain: Mountain,
};

export function MapLayerSwitcher() {
    const tileLayer = useMosqueStore((s) => s.ui.tileLayer);
    const setTileLayer = useMosqueStore((s) => s.setTileLayer);

    return (
        <div className="absolute right-3 top-3 z-[10] flex gap-1 rounded-full border-2 border-[#BCC7D2] bg-[#DCE3EA] p-1 shadow-xl">
            {MAP_LAYERS.map((layer) => {
                const Icon = ICONS[layer.id];
                const active = tileLayer === layer.id;
                return (
                    <button
                        key={layer.id}
                        type="button"
                        onClick={() => setTileLayer(layer.id)}
                        className={cn(
                            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all duration-200 sm:px-3 sm:text-xs',
                            active
                                ? 'bg-[#EC7D55] text-[#253341] shadow-sm scale-105'
                                : 'text-[#253341] hover:bg-[#DBE6DD]'
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
