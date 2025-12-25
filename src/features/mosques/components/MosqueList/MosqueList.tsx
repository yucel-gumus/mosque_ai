import type { Mosque } from '../../types/mosque.types';
import './MosqueList.css';

interface MosqueListProps {
    /** Gösterilecek camiler */
    mosques: Mosque[];
    /** Seçili cami ID'si */
    selectedId: number | null;
    /** Toplam cami sayısı (filtrelenmemiş) */
    totalCount: number;
    /** Liste kesildi mi? */
    isTruncated: boolean;
    /** Cami seçildiğinde çağrılır */
    onSelect: (id: number) => void;
}

/**
 * Cami listesi komponenti.
 *
 * @description
 * Mesafeye göre sıralı cami listesi. Seçili cami vurgulanır,
 * hover efektleri ve truncation bildirimi içerir.
 */
export function MosqueList({
    mosques,
    selectedId,
    totalCount,
    isTruncated,
    onSelect,
}: MosqueListProps) {
    return (
        <>
            <ul className="mosque-list">
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
                                className={`mosque-list-item ${isActive ? 'mosque-list-item--active' : ''}`}
                                onClick={() => onSelect(mosque.id)}
                                aria-pressed={isActive}
                            >
                                <span className="mosque-list-item__content">
                                    <strong className="mosque-list-item__name">{mosque.name}</strong>
                                    <small className="mosque-list-item__meta">
                                        {district}
                                        {neighborhood}
                                    </small>
                                </span>
                                <span className="mosque-list-item__coords">
                                    {mosque.lat.toFixed(2)}, {mosque.lon.toFixed(2)}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            {isTruncated && (
                <p className="mosque-list-hint">
                    Yalnızca ilk {mosques.length} / {totalCount} sonuç listeleniyor. Kaydırıcıyı
                    artırarak veya ilçe filtresiyle daraltarak daha fazla kayıt görebilirsin.
                </p>
            )}
        </>
    );
}
