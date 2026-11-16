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
                            ? 'bg-[#DBE6DD] border-[#EC7D55] border-l-4 border-l-[#AB421C] shadow-md'
                            : 'bg-[#F5F9F5] border-[#BCC7D2] hover:bg-[#DBE6DD] hover:border-[#3E5164]/40'
                    )}
                >
                    <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => onSelect(mosque.id)}
                        aria-pressed={isActive}
                        aria-current={isActive ? 'true' : undefined}
                    >
                        <p className="truncate text-xs font-bold text-[#253341] sm:text-sm">
                            {mosque.name}
                        </p>
                        <p className="flex items-center gap-1.5 truncate text-[10px] font-semibold text-[#3E5164]">
                            <span className="truncate">
                                {district}
                                {neighborhood}
                            </span>
                            {showDistance && distance !== undefined && (
                                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#F2A488]/60 px-2 py-0.5 text-[9px] font-extrabold text-[#253341]">
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
                        className="shrink-0 p-1 text-[#3E5164] transition-transform duration-200 hover:scale-110"
                        aria-label={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                        title={isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                    >
                        <Heart
                            className={cn(
                                'h-4 w-4 transition-colors duration-200',
                                isFavorite && 'fill-[#AB421C] text-[#AB421C]'
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
        <Card className="overflow-hidden h-[240px] sm:h-[280px] lg:h-full lg:min-h-[320px] flex flex-col rounded-3xl border-2 border-[#BCC7D2] bg-[#DCE3EA] shadow-xl">
            <div className="p-3 border-b border-[#BCC7D2] shrink-0 bg-[#EDF3EE]/70">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3E5164] pointer-events-none" />
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
                        className="pl-9 pr-9 h-9 text-xs font-semibold rounded-2xl border-[#BCC7D2] bg-[#F5F9F5] text-[#253341] focus-visible:ring-[#EC7D55]"
                    />
                    {localQuery && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3E5164] hover:text-[#253341] transition-colors duration-200"
                            aria-label="Aramayı temizle"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <p className="mt-1.5 text-[10px] font-bold text-[#3E5164]">
                    {localQuery
                        ? `${mosques.length} / ${totalAfterFilter} sonuç`
                        : `Toplam ${totalAfterFilter} cami`}
                </p>
            </div>
            <CardContent className="p-1 flex-1 min-h-0 bg-[#EDF3EE]/50">
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
                    <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center text-xs font-semibold text-[#3E5164]">
                        <p>"{localQuery}" için sonuç bulunamadı</p>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-xs font-bold text-[#253341] bg-[#EC7D55] hover:bg-[#AB421C] hover:text-[#F5F9F5] transition-colors duration-200 px-3 py-1 rounded-full shadow-sm"
                        >
                            Aramayı temizle
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
