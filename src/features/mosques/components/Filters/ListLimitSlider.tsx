import { type ChangeEvent, useCallback } from 'react';
import { LIST_LIMIT } from '../../constants/mosque.constants';

interface ListLimitSliderProps {
    /** Mevcut limit değeri */
    value: number;
    /** Değer değiştiğinde çağrılır */
    onChange: (limit: number) => void;
}

/**
 * Liste limiti kaydırıcı komponenti.
 */
export function ListLimitSlider({ value, onChange }: ListLimitSliderProps) {
    const handleSliderChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            onChange(Number(e.target.value));
        },
        [onChange]
    );

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const newValue = Math.min(
                Math.max(Math.round(Number(e.target.value)), LIST_LIMIT.MIN),
                LIST_LIMIT.MAX
            );
            onChange(newValue);
        },
        [onChange]
    );

    const handleIncrement = useCallback(() => {
        const newValue = Math.min(value + 10, LIST_LIMIT.MAX);
        onChange(newValue);
    }, [value, onChange]);

    return (
        <div className="list-limit">
            <label htmlFor="list-limit-input" className="list-limit__label">
                Listede gösterilecek cami adedi ({value})
                <input
                    type="range"
                    className="list-limit__slider"
                    min={LIST_LIMIT.MIN}
                    max={LIST_LIMIT.MAX}
                    step={LIST_LIMIT.STEP}
                    value={value}
                    onChange={handleSliderChange}
                />
            </label>

            <div className="list-limit__controls">
                <input
                    id="list-limit-input"
                    type="number"
                    className="list-limit__input"
                    min={LIST_LIMIT.MIN}
                    max={LIST_LIMIT.MAX}
                    value={value}
                    onChange={handleInputChange}
                />
                <button
                    type="button"
                    className="list-limit__btn"
                    onClick={handleIncrement}
                >
                    +10
                </button>
            </div>
        </div>
    );
}
