import { memo, useState, useMemo } from 'react';
import type { Mosque } from '../../types/mosque.types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Virtuoso } from 'react-virtuoso';
import { Search, X } from 'lucide-react';

interface MosqueListProps {
    mosques: Mosque[];
    selectedId: number | null;
    onSelect: (id: number) => void;
}

interface MosqueItemProps {
    mosque: Mosque;
    isActive: boolean;
    onSelect: (id: number) => void;
}

const normalizeText = (text: string): string => {
    return text
        .toLocaleLowerCase('tr-TR')
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
};

const MosqueItem = memo(({ mosque, isActive, onSelect }: MosqueItemProps) => {
    const district = mosque.district ?? '';
    const neighborhood = mosque.neighborhood
        ? ` • ${mosque.neighborhood}`
        : '';

    return (
        <div className="px-0.5 py-0.5 sm:px-1 sm:py-1">
            <button
                type="button"
                className={cn(
                    'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-accent rounded-md sm:gap-3 sm:px-4 sm:py-3',
                    isActive && 'bg-primary/10 border-l-2 border-l-primary'
                )}
                onClick={() => onSelect(mosque.id)}
                aria-pressed={isActive}
            >
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground sm:text-base">
                        {mosque.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                        {district}
                        {neighborhood}
                    </p>
                </div>
            </button>
        </div>
    );
});

MosqueItem.displayName = 'MosqueItem';

export function MosqueList({
    mosques,
    selectedId,
    onSelect,
}: MosqueListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMosques = useMemo(() => {
        if (!searchQuery.trim()) return mosques;

        const normalizedQuery = normalizeText(searchQuery.trim());
        return mosques.filter((mosque) => {
            const normalizedName = normalizeText(mosque.name);
            const normalizedDistrict = mosque.district ? normalizeText(mosque.district) : '';
            const normalizedNeighborhood = mosque.neighborhood ? normalizeText(mosque.neighborhood) : '';

            return (
                normalizedName.includes(normalizedQuery) ||
                normalizedDistrict.includes(normalizedQuery) ||
                normalizedNeighborhood.includes(normalizedQuery)
            );
        });
    }, [mosques, searchQuery]);

    const handleClear = () => setSearchQuery('');

    return (
        <Card className="overflow-hidden h-[200px] sm:h-[250px] md:h-[300px] lg:h-[380px] flex flex-col">
            <div className="p-2 sm:p-3 border-b shrink-0">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Cami ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-8 h-9 text-sm"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p className="text-[10px] text-muted-foreground mt-1.5 sm:text-xs">
                        {filteredMosques.length} sonuç bulundu
                    </p>
                )}
            </div>
            <CardContent className="p-0 flex-1 min-h-0">
                {filteredMosques.length > 0 ? (
                    <Virtuoso
                        style={{ height: '100%', width: '100%' }}
                        data={filteredMosques}
                        itemContent={(_, mosque) => (
                            <MosqueItem
                                mosque={mosque}
                                isActive={mosque.id === selectedId}
                                onSelect={onSelect}
                            />
                        )}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        Sonuç bulunamadı
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
