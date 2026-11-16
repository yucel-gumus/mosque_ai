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
import { Accessibility, MapPin, Ruler, RotateCcw, Car, Users, Moon } from 'lucide-react';

interface FilterPanelProps {
    districts: string[];
    resultCount: number;
}

const ALL_DISTRICTS = '__all__';

export const FilterPanel = memo(function FilterPanel({ districts, resultCount }: FilterPanelProps) {
    const {
        filters,
        setDistrict,
        setRadius,
        setWheelchairOnly,
        setHasParking,
        setHasWomenArea,
        resetFilters,
        ui,
        toggleRamadanMode,
    } = useMosqueStore();

    const isActive = useMemo(
        () =>
            filters.district !== null ||
            filters.radius !== null ||
            filters.wheelchairOnly ||
            filters.hasParking ||
            filters.hasWomenArea,
        [filters]
    );

    return (
        <Card className="flex flex-col rounded-3xl border-2 border-[#BCC7D2] bg-[#DCE3EA] shadow-xl">
            <CardContent className="space-y-3 p-3.5 sm:p-4">
                <div className="flex items-center justify-between border-b border-[#BCC7D2] pb-2">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-[#253341] sm:text-sm">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F2A488]">
                            <MapPin className="h-3.5 w-3.5 text-[#253341]" />
                        </div>
                        Filtreler & Olanaklar
                    </h3>
                    {isActive && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="h-6 px-2 text-[10px] font-bold text-[#253341] hover:bg-[#DBE6DD] rounded-full transition-colors duration-200"
                        >
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Sıfırla
                        </Button>
                    )}
                </div>

                {/* Ramazan Modu Hızlı Geçiş */}
                <div className="flex items-center justify-between p-2 rounded-2xl bg-[#253341] text-[#F5F9F5]">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold">
                        <Moon className="h-3.5 w-3.5 text-[#F2A488] fill-[#F2A488]" />
                        Ramazan Modu Paneli
                    </span>
                    <button
                        type="button"
                        onClick={toggleRamadanMode}
                        className={`h-5 w-9 rounded-full transition-colors duration-200 relative ${
                            ui.ramadanMode ? 'bg-[#EC7D55]' : 'bg-[#3E5164]'
                        }`}
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-[#F5F9F5] shadow transition-transform duration-200 ${
                                ui.ramadanMode ? 'translate-x-4' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>

                {/* İlçe */}
                <div className="space-y-1">
                    <Label htmlFor="district-select" className="text-[11px] font-bold text-[#253341] sm:text-xs">
                        İlçe Seçimi
                    </Label>
                    <Select
                        value={filters.district ?? ALL_DISTRICTS}
                        onValueChange={(value) =>
                            setDistrict(value === ALL_DISTRICTS ? null : value)
                        }
                    >
                        <SelectTrigger id="district-select" className="h-9 rounded-2xl border-[#BCC7D2] bg-[#F5F9F5] text-xs font-semibold text-[#253341] transition-colors duration-200">
                            <SelectValue placeholder="Tüm ilçeler" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-[#BCC7D2] bg-[#F5F9F5] text-[#253341]">
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
                        <Label className="flex items-center gap-1.5 text-[11px] font-bold text-[#253341] sm:text-xs">
                            <Ruler className="h-3.5 w-3.5 text-[#253341]" />
                            Mesafe Yarıçapı
                        </Label>
                        <span className="text-[11px] font-extrabold text-[#253341] bg-[#F2A488] px-2 py-0.5 rounded-full">
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

                {/* Tesis & Olanak Filtreleri */}
                <div className="space-y-1.5 pt-1">
                    <Label className="text-[11px] font-bold text-[#253341] sm:text-xs">
                        Özel Olanaklar
                    </Label>
                    <div className="grid grid-cols-1 gap-1.5">
                        {/* Erişilebilir */}
                        <button
                            type="button"
                            onClick={() => setWheelchairOnly(!filters.wheelchairOnly)}
                            className={`flex w-full items-center justify-between rounded-2xl border p-2 transition-all duration-300 ${
                                filters.wheelchairOnly
                                    ? 'border-[#EC7D55] bg-[#DBE6DD] shadow-sm'
                                    : 'border-[#BCC7D2] bg-[#EDF3EE] hover:bg-[#DBE6DD]'
                            }`}
                        >
                            <span className="flex items-center gap-2 text-[11px] font-bold text-[#253341]">
                                <Accessibility className="h-3.5 w-3.5 text-[#253341]" />
                                Engelli Erişimi / Rampa
                            </span>
                            <span
                                className={`relative h-4 w-7 shrink-0 rounded-full transition-colors duration-200 inline-block ${
                                    filters.wheelchairOnly ? 'bg-[#EC7D55]' : 'bg-[#BCC7D2]'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-[#F5F9F5] shadow transition-transform duration-200 ${
                                        filters.wheelchairOnly ? 'translate-x-3' : 'translate-x-0'
                                    }`}
                                />
                            </span>
                        </button>

                        {/* Otopark */}
                        <button
                            type="button"
                            onClick={() => setHasParking(!filters.hasParking)}
                            className={`flex w-full items-center justify-between rounded-2xl border p-2 transition-all duration-300 ${
                                filters.hasParking
                                    ? 'border-[#EC7D55] bg-[#DBE6DD] shadow-sm'
                                    : 'border-[#BCC7D2] bg-[#EDF3EE] hover:bg-[#DBE6DD]'
                            }`}
                        >
                            <span className="flex items-center gap-2 text-[11px] font-bold text-[#253341]">
                                <Car className="h-3.5 w-3.5 text-[#253341]" />
                                Otopark Olanadığı
                            </span>
                            <span
                                className={`relative h-4 w-7 shrink-0 rounded-full transition-colors duration-200 inline-block ${
                                    filters.hasParking ? 'bg-[#EC7D55]' : 'bg-[#BCC7D2]'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-[#F5F9F5] shadow transition-transform duration-200 ${
                                        filters.hasParking ? 'translate-x-3' : 'translate-x-0'
                                    }`}
                                />
                            </span>
                        </button>

                        {/* Kadınlar Bölümü */}
                        <button
                            type="button"
                            onClick={() => setHasWomenArea(!filters.hasWomenArea)}
                            className={`flex w-full items-center justify-between rounded-2xl border p-2 transition-all duration-300 ${
                                filters.hasWomenArea
                                    ? 'border-[#EC7D55] bg-[#DBE6DD] shadow-sm'
                                    : 'border-[#BCC7D2] bg-[#EDF3EE] hover:bg-[#DBE6DD]'
                            }`}
                        >
                            <span className="flex items-center gap-2 text-[11px] font-bold text-[#253341]">
                                <Users className="h-3.5 w-3.5 text-[#253341]" />
                                Kadınlar Bölümü
                            </span>
                            <span
                                className={`relative h-4 w-7 shrink-0 rounded-full transition-colors duration-200 inline-block ${
                                    filters.hasWomenArea ? 'bg-[#EC7D55]' : 'bg-[#BCC7D2]'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-[#F5F9F5] shadow transition-transform duration-200 ${
                                        filters.hasWomenArea ? 'translate-x-3' : 'translate-x-0'
                                    }`}
                                />
                            </span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#BCC7D2] pt-2.5">
                    <span className="text-[11px] font-bold text-[#3E5164]">Listelenen Cami</span>
                    <Badge className="bg-[#DBE6DD] text-[#253341] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#BCC7D2]">
                        {resultCount} cami
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
});
