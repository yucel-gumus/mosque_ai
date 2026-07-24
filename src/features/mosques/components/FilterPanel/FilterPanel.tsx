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
        <Card className="flex flex-col rounded-3xl border-2 border-[#FFB6A6] bg-[#FFF6EC] shadow-xl">
            <CardContent className="space-y-3 p-3.5 sm:p-4">
                <div className="flex items-center justify-between border-b border-[#FFB6A6]/30 pb-2">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-[#4A2B20] sm:text-sm">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFB6A6]">
                            <MapPin className="h-3.5 w-3.5 text-[#4A2B20]" />
                        </div>
                        Filtreler
                    </h3>
                    {isActive && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="h-6 px-2 text-[10px] font-bold text-[#4A2B20] hover:bg-[#FFB6A6]/30 rounded-full"
                        >
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Sıfırla
                        </Button>
                    )}
                </div>

                {/* İlçe */}
                <div className="space-y-1">
                    <Label htmlFor="district-select" className="text-[11px] font-bold text-[#4A2B20] sm:text-xs">
                        İlçe Seçimi
                    </Label>
                    <Select
                        value={filters.district ?? ALL_DISTRICTS}
                        onValueChange={(value) =>
                            setDistrict(value === ALL_DISTRICTS ? null : value)
                        }
                    >
                        <SelectTrigger id="district-select" className="h-9 rounded-2xl border-[#FFB6A6] bg-[#FFEBD3]/60 text-xs font-semibold text-[#4A2B20]">
                            <SelectValue placeholder="Tüm ilçeler" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-[#FFB6A6] bg-[#FFF6EC] text-[#4A2B20]">
                            <SelectItem value={ALL_DISTRICTS} className="font-semibold">Tüm ilçeler</SelectItem>
                            {districts.map((d) => (
                                <SelectItem key={d} value={d} className="font-medium">
                                    {d}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Mesafe */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-1.5 text-[11px] font-bold text-[#4A2B20] sm:text-xs">
                            <Ruler className="h-3.5 w-3.5 text-[#4A2B20]" />
                            Mesafe Yarıçapı
                        </Label>
                        <span className="text-[11px] font-extrabold text-[#1A4036] bg-[#9BCEC1] px-2 py-0.5 rounded-full">
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
                        className="py-1"
                    />
                </div>

                {/* Erişilebilir */}
                <div className="space-y-1">
                    <button
                        type="button"
                        onClick={() => setWheelchairOnly(!filters.wheelchairOnly)}
                        className={`flex w-full items-center justify-between rounded-2xl border p-2 transition-all duration-300 ${
                            filters.wheelchairOnly
                                ? 'border-[#9BCEC1] bg-[#9BCEC1]/30 shadow-sm'
                                : 'border-[#FFB6A6] bg-[#FFEBD3]/50 hover:bg-[#FFEBD3]'
                        }`}
                        aria-pressed={filters.wheelchairOnly}
                    >
                        <span className="flex items-center gap-2 text-[11px] font-bold text-[#4A2B20] sm:text-xs">
                            <Accessibility className="h-4 w-4 text-[#4A2B20]" />
                            Engelli / Tekerlekli Sandalye
                        </span>
                        <span
                            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 inline-block ${
                                filters.wheelchairOnly ? 'bg-[#9BCEC1]' : 'bg-[#FFB6A6]'
                            }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-[#FFF6EC] shadow transition-transform duration-200 ${
                                    filters.wheelchairOnly ? 'translate-x-4' : 'translate-x-0'
                                }`}
                            />
                        </span>
                    </button>
                    <p className="text-[9px] font-medium text-[#8C5E50] leading-tight px-1">
                        Giriş rampası veya engelli erişimine uygun camileri filtreler.
                    </p>
                </div>

                <div className="flex items-center justify-between border-t border-[#FFB6A6]/40 pt-2.5">
                    <span className="text-[11px] font-bold text-[#8C5E50]">Listelenen Cami</span>
                    <Badge className="bg-[#9BCEC1] text-[#1A4036] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#7CB8AA]">
                        {resultCount} cami
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
});
