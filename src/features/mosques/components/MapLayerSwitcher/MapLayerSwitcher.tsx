import { useMosqueStore } from '../../store/mosqueStore';
import { MAP_LAYERS } from '../../utils/mapLayers';
import { cn } from '@/lib/utils';
import { Map, Moon, Satellite } from 'lucide-react';
import type { TileLayerId } from '../../types/mosque.types';

const ICONS: Record<TileLayerId, typeof Map> = {
    voyager: Map,
    dark: Moon,
    satellite: Satellite,
};

export function MapLayerSwitcher() {
    const tileLayer = useMosqueStore((s) => s.ui.tileLayer);
    const setTileLayer = useMosqueStore((s) => s.setTileLayer);

    return (
        <div className="absolute right-3 top-3 z-[1000] flex gap-1 rounded-full border border-border bg-background/95 p-1 shadow-md backdrop-blur">
            {MAP_LAYERS.map((layer) => {
                const Icon = ICONS[layer.id];
                const active = tileLayer === layer.id;
                return (
                    <button
                        key={layer.id}
                        type="button"
                        onClick={() => setTileLayer(layer.id)}
                        className={cn(
                            'flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium transition-colors sm:px-2.5 sm:text-xs',
                            active
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                        title={layer.name}
                    >
                        <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="hidden sm:inline">{layer.name}</span>
                    </button>
                );
            })}
        </div>
    );
}
