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
            <div className="px-1.5 py-1">
                <div
                    className={cn(
                        'group flex w-full items-center gap-2 rounded-2xl border p-2.5 transition-all duration-300 shadow-sm cursor-pointer',
                        isActive
                            ? 'bg-[#9BCEC1]/30 border-[#9BCEC1] border-l-4 border-l-[#1A4036] shadow-md'
                            : 'bg-[#FFF6EC] border-[#FFB6A6]/60 hover:bg-[#FFEBD3] hover:border-[#FFB6A6]'
                    )}
                >
                    <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => onSelect(mosque.id)}
                        aria-pressed={isActive}
                        aria-current={isActive ? 'true' : undefined}
                    >
                        <p className="truncate text-xs font-bold text-[#4A2B20] sm:text-sm">
                            {mosque.name}
                        </p>
                        <p className="flex items-center gap-1.5 truncate text-[10px] font-semibold text-[#8C5E50]">
                            <span className="truncate">
                                {district}
                                {neighborhood}
                            </span>
                            {showDistance && distance !== undefined && (
                                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#9BCEC1]/40 px-2 py-0.5 text-[9px] font-extrabold text-[#1A4036]">
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
                        className="shrink-0 p-1 text-[#8C5E50] transition-transform hover:scale-110"
                        aria-label={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                        title={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                    >
                        <Heart
                            className={cn(
                                'h-4 w-4',
                                isFavorite && 'fill-[#E06C62] text-[#E06C62]'
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
        <Card className="overflow-hidden h-[240px] sm:h-[280px] lg:h-full lg:min-h-[320px] flex flex-col rounded-3xl border-2 border-[#FFB6A6] bg-[#FFF6EC] shadow-xl">
            <div className="p-3 border-b border-[#FFB6A6]/40 shrink-0 bg-[#FFEBD3]/50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C5E50] pointer-events-none" />
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
                        className="pl-9 pr-9 h-9 text-xs font-semibold rounded-2xl border-[#FFB6A6] bg-[#FFF6EC] text-[#4A2B20] focus-visible:ring-[#9BCEC1]"
                    />
                    {localQuery && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C5E50] hover:text-[#4A2B20] transition-colors"
                            aria-label="Aramayı temizle"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <p className="mt-1.5 text-[10px] font-bold text-[#8C5E50]">
                    {localQuery
                        ? `${mosques.length} / ${totalAfterFilter} sonuç`
                        : `Toplam ${totalAfterFilter} cami`}
                </p>
            </div>
            <CardContent className="p-1 flex-1 min-h-0 bg-[#FFEBD3]/30">
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
                    <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center text-xs font-semibold text-[#8C5E50]">
                        <p>"{localQuery}" için sonuç bulunamadı</p>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-xs font-bold text-[#1A4036] bg-[#9BCEC1] px-3 py-1 rounded-full shadow-sm hover:underline"
                        >
                            Aramayı temizle
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
