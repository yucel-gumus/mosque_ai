import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { LIST_LIMIT } from '../../constants/mosque.constants';
import { Plus } from 'lucide-react';


interface ListLimitSliderProps {
    value: number;
    onChange: (limit: number) => void;
}

export function ListLimitSlider({ value, onChange }: ListLimitSliderProps) {
    const handleSliderChange = (values: number[]) => {
        onChange(values[0]);
    };

    const handleIncrement = () => {
        const newValue = Math.min(value + 10, LIST_LIMIT.MAX);
        onChange(newValue);
    };

    return (
        <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground whitespace-nowrap">
                Limit: {value}
            </label>
            <Slider
                value={[value]}
                onValueChange={handleSliderChange}
                min={LIST_LIMIT.MIN}
                max={LIST_LIMIT.MAX}
                step={LIST_LIMIT.STEP}
                className="w-32"
            />
            <Button
                variant="outline"
                size="sm"
                onClick={handleIncrement}
                className="h-8 gap-1 px-2"
                title="Limiti 10 artır"
            >
                <Plus className="h-3 w-3" />
                <span>10</span>
            </Button>
        </div>
    );
}
