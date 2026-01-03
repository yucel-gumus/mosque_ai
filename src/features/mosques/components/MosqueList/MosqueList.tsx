import { memo } from 'react';
import type { Mosque } from '../../types/mosque.types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';

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

const MosqueItem = memo(({ mosque, isActive, onSelect }: MosqueItemProps) => {
    const district = mosque.district ?? 'İlçe bilinmiyor';
    const neighborhood = mosque.neighborhood
        ? ` • ${mosque.neighborhood}`
        : '';

    return (
        <div className="px-1 py-1">
            <button
                type="button"
                className={cn(
                    'flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-accent rounded-md',
                    isActive && 'bg-primary/10 border-l-2 border-l-primary'
                )}
                onClick={() => onSelect(mosque.id)}
                aria-pressed={isActive}
            >
                <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                        {mosque.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {district}
                        {neighborhood}
                    </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                        {mosque.lat.toFixed(2)}, {mosque.lon.toFixed(2)}
                    </span>
                </div>
            </button>
        </div>
    );
});

export function MosqueList({
    mosques,
    selectedId,
    onSelect,
}: MosqueListProps) {
    return (
        <Card className="flex-1 overflow-hidden h-[400px]">
            <CardContent className="p-0 h-full">
                <Virtuoso
                    style={{ height: '100%', width: '100%' }}
                    data={mosques}
                    itemContent={(_, mosque) => (
                        <MosqueItem
                            mosque={mosque}
                            isActive={mosque.id === selectedId}
                            onSelect={onSelect}
                        />
                    )}
                />
            </CardContent>
        </Card>
    );
}
