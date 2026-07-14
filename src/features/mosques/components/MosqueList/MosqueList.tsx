import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Virtuoso } from 'react-virtuoso';
import { Search, X, Heart, Ruler } from 'lucide-react';
import { useMosqueStore } from '../../store/mosqueStore';
import { useDebouncedCallback } from '@/shared/hooks/useDebouncedCallback';
import type { SortedMosque } from '../../hooks/useDistanceSort';

interface MosqueListProps {
    mosques: SortedMosque[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    /** Tüm sonuçlar filtreye rağmen değişti mi — listede "X sonuç" rozeti için */
    totalAfterFilter: number;
}

interface MosqueItemProps {
    mosque: SortedMosque;
    isActive: boolean;
    isFavorite: boolean;
    onSelect: (id: number) => void;
    onToggleFavorite: (id: number) => void;
    showDistance: boolean;
}

const MosqueItem = memo(
    ({
        mosque,
        isActive,
        isFavorite,
        onSelect,
        onToggleFavorite,
        showDistance,
    }: MosqueItemProps) => {
        const district = mosque.district ?? '';
        const neighborhood = mosque.neighborhood ? ` • ${mosque.neighborhood}` : '';
        const distance = mosque.distance;

        return (
            <div className="px-1 py-0.5 sm:px-1.5 sm:py-0.5">
                <div
                    className={cn(
                        'group flex w-full items-center gap-1.5 rounded-lg border px-2.5 py-2 transition-all duration-300 hover:bg-card hover:border-border hover:shadow-sm sm:gap-2.5 sm:px-3 sm:py-2.5 cursor-pointer',
                        isActive
                            ? 'active-mosque-item'
                            : 'bg-card/50 border-border/50'
                    )}
                >
                    <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => onSelect(mosque.id)}
                        aria-pressed={isActive}
                        aria-current={isActive ? 'true' : undefined}
                    >
                        <p className="truncate text-xs font-medium text-foreground sm:text-sm">
                            {mosque.name}
                        </p>
                        <p className="flex items-center gap-1.5 truncate text-[9px] text-muted-foreground sm:text-[10px]">
                            <span className="truncate">
                                {district}
                                {neighborhood}
                            </span>
                            {showDistance && distance !== undefined && (
                                <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-muted px-1 py-0.5 text-[9px] font-mono sm:text-[10px]">
                                    <Ruler className="h-2.5 w-2.5" />
                                    {distance < 1000
                                        ? `${Math.round(distance)} m`
                                        : `${(distance / 1000).toFixed(1)} km`}
                                </span>
                            )}
                        </p>
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(mosque.id);
                        }}
                        className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-red-500"
                        aria-label={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                        title={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                    >
                        <Heart
                            className={cn(
                                'h-3.5 w-3.5 sm:h-4 sm:w-4',
                                isFavorite && 'fill-red-500 text-red-500'
                            )}
                        />
                    </button>
                </div>
            </div>
        );
    }
);

MosqueItem.displayName = 'MosqueItem';

export function MosqueList({
    mosques,
    selectedId,
    onSelect,
    totalAfterFilter,
}: MosqueListProps) {
    const searchQuery = useMosqueStore((s) => s.searchQuery);
    const setSearchQuery = useMosqueStore((s) => s.setSearchQuery);
    const favorites = useMosqueStore((s) => s.favorites);
    const toggleFavorite = useMosqueStore((s) => s.toggleFavorite);
    const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const [localQuery, setLocalQuery] = useState(searchQuery);

    const debouncedSetSearchQuery = useDebouncedCallback((q: string) => {
        setSearchQuery(q);
    }, 200);

    // Sync local state when store changes (e.g. from shortcut)
    useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

    const showDistance = mosques[0]?.distance !== undefined;

    const handleClear = () => {
        setLocalQuery('');
        setSearchQuery('');
        inputRef.current?.focus();
    };

    return (
        <Card className="overflow-hidden h-[220px] sm:h-[260px] lg:h-full lg:min-h-[300px] flex flex-col">
            <div className="p-2 border-b shrink-0">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        ref={inputRef}
                        id="mosque-search"
                        type="text"
                        placeholder="Cami ara... ( / )"
                        value={localQuery}
                        onChange={(e) => {
                            setLocalQuery(e.target.value);
                            debouncedSetSearchQuery(e.target.value);
                        }}
                        className="pl-8 pr-8 h-8 text-xs"
                    />
                    {localQuery && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Aramayı temizle"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <p className="mt-1 text-[9px] text-muted-foreground sm:text-[10px]">
                    {localQuery
                        ? `${mosques.length} / ${totalAfterFilter} sonuç`
                        : `Toplam ${totalAfterFilter} cami`}
                </p>
            </div>
            <CardContent className="p-0 flex-1 min-h-0">
                {mosques.length > 0 ? (
                    <Virtuoso
                        style={{ height: '100%', width: '100%' }}
                        data={mosques}
                        itemContent={(_, mosque) => (
                            <MosqueItem
                                mosque={mosque}
                                isActive={mosque.id === selectedId}
                                isFavorite={isFavorite(mosque.id)}
                                onSelect={onSelect}
                                onToggleFavorite={toggleFavorite}
                                showDistance={showDistance}
                            />
                        )}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center text-sm text-muted-foreground">
                        <p>"{localQuery}" için sonuç bulunamadı</p>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-xs text-primary hover:underline"
                        >
                            Aramayı temizle
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
