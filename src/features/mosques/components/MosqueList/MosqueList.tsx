import { memo } from 'react';
import type { Mosque } from '../../types/mosque.types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
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
    return (
        <Card className="overflow-hidden h-[200px] sm:h-[250px] md:h-[300px] lg:h-[380px]">
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

