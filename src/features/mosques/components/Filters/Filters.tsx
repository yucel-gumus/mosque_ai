import { DistrictFilter } from './DistrictFilter';
import { ListLimitSlider } from './ListLimitSlider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, List, Navigation } from 'lucide-react';

interface FiltersProps {
    activeDistrict: string;
    districtOptions: string[];
    totalCount: number;
    filteredCount: number;
    displayedCount: number;
    listLimit: number;
    geoStatusMessage: string;
    onDistrictChange: (district: string) => void;
    onListLimitChange: (limit: number) => void;
    onResetFilter: () => void;
}

export function Filters({
    activeDistrict,
    districtOptions,
    totalCount,
    filteredCount,
    displayedCount,
    listLimit,
    geoStatusMessage,
    onDistrictChange,
    onListLimitChange,
    onResetFilter,
}: FiltersProps) {
    return (
        <div className="mb-6 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                <DistrictFilter
                    value={activeDistrict}
                    options={districtOptions}
                    totalCount={totalCount}
                    onChange={onDistrictChange}
                />

                <ListLimitSlider value={listLimit} onChange={onListLimitChange} />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    Haritada: {filteredCount}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                    <List className="h-3 w-3" />
                    Listede: {displayedCount}
                </Badge>
                {activeDistrict !== 'all' && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilter}
                        className="h-6 px-2 text-xs"
                    >
                        Filtreyi sıfırla
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Navigation className="h-3 w-3" />
                <span>
                    Konum bazlı liste ilk {listLimit} sonucu gösterir. {geoStatusMessage}
                </span>
            </div>
        </div>
    );
}
