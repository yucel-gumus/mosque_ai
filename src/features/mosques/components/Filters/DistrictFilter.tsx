import { type ChangeEvent, useCallback } from 'react';

interface DistrictFilterProps {
    /** Mevcut seçili ilçe */
    value: string;
    /** Kullanılabilir ilçeler */
    options: string[];
    /** Toplam cami sayısı */
    totalCount: number;
    /** Değer değiştiğinde çağrılır */
    onChange: (district: string) => void;
}

/**
 * İlçe filtresi dropdown komponenti.
 */
export function DistrictFilter({
    value,
    options,
    totalCount,
    onChange,
}: DistrictFilterProps) {
    const handleChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            onChange(e.target.value);
        },
        [onChange]
    );

    return (
        <label className="district-filter">
            İlçe filtresi
            <select
                className="district-filter__select"
                value={value}
                onChange={handleChange}
            >
                <option value="all">Tüm ilçeler ({totalCount})</option>
                {options.map((district) => (
                    <option key={district} value={district}>
                        {district}
                    </option>
                ))}
            </select>
        </label>
    );
}
