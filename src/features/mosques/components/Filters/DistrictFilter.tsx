import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface DistrictFilterProps {
    value: string;
    options: string[];
    totalCount: number;
    onChange: (district: string) => void;
}

export function DistrictFilter({
    value,
    options,
    totalCount,
    onChange,
}: DistrictFilterProps) {
    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">İlçe:</label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="İlçe seçin" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tüm ilçeler ({totalCount})</SelectItem>
                    {options.map((district) => (
                        <SelectItem key={district} value={district}>
                            {district}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
