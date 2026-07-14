import { useMemo, memo } from 'react';
import { useMosqueStore } from '../../store/mosqueStore';
import { RADIUS_LIMITS } from '../../constants/mosque.constants';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accessibility, MapPin, Ruler, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
    districts: string[];
    /** Toplam filtre uygulandıktan sonra kaç sonuç var (bilgi amaçlı). */
    resultCount: number;
}

const ALL_DISTRICTS = '__all__';

export const FilterPanel = memo(function FilterPanel({ districts, resultCount }: FilterPanelProps) {
    const { filters, setDistrict, setRadius, setWheelchairOnly, resetFilters } =
        useMosqueStore();

    const isActive = useMemo(
        () =>
            filters.district !== null ||
            filters.radius !== null ||
            filters.wheelchairOnly,
        [filters]
    );

    return (
        <Card className="flex flex-col">
            <CardContent className="space-y-2 p-2 sm:p-2.5">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
                        <MapPin className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                        Filtreler
                    </h3>
                    {isActive && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="h-6 text-[10px] px-2"
                        >
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Sıfırla
                        </Button>
                    )}
                </div>

                {/* İlçe */}
                <div className="space-y-1">
                    <Label htmlFor="district-select" className="text-[10px] sm:text-xs">
                        İlçe
                    </Label>
                    <Select
                        value={filters.district ?? ALL_DISTRICTS}
                        onValueChange={(value) =>
                            setDistrict(value === ALL_DISTRICTS ? null : value)
                        }
                    >
                        <SelectTrigger id="district-select" className="h-8 text-xs">
                            <SelectValue placeholder="Tüm ilçeler" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_DISTRICTS}>Tüm ilçeler</SelectItem>
                            {districts.map((d) => (
                                <SelectItem key={d} value={d}>
                                    {d}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Mesafe */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-1 text-[10px] sm:text-xs">
                            <Ruler className="h-3 w-3" />
                            Yarıçap
                        </Label>
                        <span className="text-[10px] font-medium text-muted-foreground sm:text-xs">
                            {filters.radius ? `${(filters.radius / 1000).toFixed(1)} km` : 'Sınırsız'}
                        </span>
                    </div>
                    <Slider
                        min={RADIUS_LIMITS.MIN}
                        max={RADIUS_LIMITS.MAX}
                        step={RADIUS_LIMITS.STEP}
                        value={[filters.radius ?? RADIUS_LIMITS.MAX]}
                        onValueChange={([v]) =>
                            setRadius(v >= RADIUS_LIMITS.MAX ? null : v)
                        }
                    />
                </div>

                {/* Erişilebilir */}
                <div className="space-y-1">
                    <button
                        type="button"
                        onClick={() => setWheelchairOnly(!filters.wheelchairOnly)}
                        className={`flex w-full items-center justify-between rounded-lg border p-1.5 transition-all duration-300 ${
                            filters.wheelchairOnly
                                ? 'border-primary/20 bg-primary/5 shadow-xs'
                                : 'border-border/60 bg-card/45 hover:bg-card hover:border-border'
                        }`}
                        aria-pressed={filters.wheelchairOnly}
                    >
                        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium">
                            <Accessibility className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                            Engelli / Tekerlekli Sandalye
                        </span>
                        <span
                            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 inline-block ${
                                filters.wheelchairOnly ? 'bg-primary' : 'bg-muted-foreground/30'
                            }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                                    filters.wheelchairOnly ? 'translate-x-4' : 'translate-x-0'
                                }`}
                            />
                        </span>
                    </button>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-normal px-1">
                        Giriş rampası veya tekerlekli sandalye erişimine uygun düz girişi bulunan camileri filtreler.
                    </p>
                </div>

                <div className="flex items-center justify-between border-t pt-2.5">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Sonuç</span>
                    <Badge variant="secondary" className="text-[10px]">
                        {resultCount} cami
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
});
