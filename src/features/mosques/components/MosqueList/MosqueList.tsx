import type { Mosque } from '../../types/mosque.types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface MosqueListProps {
    mosques: Mosque[];
    selectedId: number | null;
    totalCount: number;
    isTruncated: boolean;
    onSelect: (id: number) => void;
}

export function MosqueList({
    mosques,
    selectedId,
    totalCount,
    isTruncated,
    onSelect,
}: MosqueListProps) {
    return (
        <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0">
                <ul className="max-h-[400px] divide-y divide-border overflow-y-auto">
                    {mosques.map((mosque) => {
                        const isActive = mosque.id === selectedId;
                        const district = mosque.district ?? 'İlçe bilinmiyor';
                        const neighborhood = mosque.neighborhood
                            ? ` • ${mosque.neighborhood}`
                            : '';

                        return (
                            <li key={mosque.id}>
                                <button
                                    type="button"
                                    className={cn(
                                        'flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-accent',
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
                            </li>
                        );
                    })}
                </ul>

                {isTruncated && (
                    <div className="border-t border-border bg-muted/50 px-4 py-2 text-center text-xs text-muted-foreground">
                        Yalnızca ilk {mosques.length} / {totalCount} sonuç listeleniyor.
                        Kaydırıcıyı artırarak daha fazla kayıt görebilirsin.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
