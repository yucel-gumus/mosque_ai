import { DistrictFilter } from './DistrictFilter';
import { ListLimitSlider } from './ListLimitSlider';
import './Filters.css';

interface FiltersProps {
    /** Seçili ilçe */
    activeDistrict: string;
    /** Kullanılabilir ilçeler */
    districtOptions: string[];
    /** Toplam cami sayısı */
    totalCount: number;
    /** Filtrelenmiş cami sayısı */
    filteredCount: number;
    /** Listede gösterilen cami sayısı */
    displayedCount: number;
    /** Liste limiti */
    listLimit: number;
    /** Konum durumu mesajı */
    geoStatusMessage: string;
    /** İlçe değiştiğinde çağrılır */
    onDistrictChange: (district: string) => void;
    /** Liste limiti değiştiğinde çağrılır */
    onListLimitChange: (limit: number) => void;
    /** Filtre sıfırlandığında çağrılır */
    onResetFilter: () => void;
}

/**
 * Filtre kontrolleri container komponenti.
 *
 * @description
 * İlçe filtresi, liste limiti ve filtre metalarını içerir.
 */
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
        <div className="filters">
            <DistrictFilter
                value={activeDistrict}
                options={districtOptions}
                totalCount={totalCount}
                onChange={onDistrictChange}
            />

            <ListLimitSlider value={listLimit} onChange={onListLimitChange} />

            <div className="filter-meta">
                <p className="filter-meta__summary">
                    Haritada: {filteredCount} cami · Listede: {displayedCount}
                    {activeDistrict !== 'all' && (
                        <>
                            {' '}
                            ·{' '}
                            <button
                                type="button"
                                className="filter-meta__reset"
                                onClick={onResetFilter}
                            >
                                filtreyi sıfırla
                            </button>
                        </>
                    )}
                </p>
                <small className="filter-meta__hint">
                    Konum bazlı liste ilk {listLimit} sonucu gösterir. {geoStatusMessage}
                </small>
                <small className="filter-meta__hint">
                    Çok geniş sonuçlarda performans için otomatik kümeleme devrede. Tüm
                    İstanbul verileri haritada hazır.
                </small>
            </div>
        </div>
    );
}
