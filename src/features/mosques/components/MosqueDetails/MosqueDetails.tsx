import type { Mosque } from '../../types/mosque.types';
import { formatCoordinates } from '../../utils/geo.utils';
import './MosqueDetails.css';

interface MosqueDetailsProps {
    /** Gösterilecek cami */
    mosque: Mosque;
    /** Filtrelenmiş cami sayısı */
    filteredCount: number;
    /** Toplam cami sayısı */
    totalCount: number;
    /** Listede gösterilen maksimum cami sayısı */
    listLimit: number;
}

/**
 * Seçili cami detay paneli.
 *
 * @description
 * Caminin adı, koordinatları, ilçe/mahalle bilgisi ve
 * OSM/Wikidata bağlantılarını gösterir.
 */
export function MosqueDetails({
    mosque,
    filteredCount,
    totalCount,
    listLimit,
}: MosqueDetailsProps) {
    return (
        <div className="mosque-details">
            <p className="mosque-details__meta">
                Filtrelenen cami: {filteredCount} · İstanbul geneli: {totalCount}
            </p>

            <h2 className="mosque-details__name">{mosque.name}</h2>

            <p className="mosque-details__coords">
                Koordinatlar: {formatCoordinates(mosque.lat, mosque.lon, 5)}
            </p>

            <ul className="mosque-details__attributes">
                {mosque.district && (
                    <li className="mosque-details__attribute">
                        <span>İlçe</span>
                        <span className="mosque-details__attribute-value">{mosque.district}</span>
                    </li>
                )}

                {mosque.neighborhood && (
                    <li className="mosque-details__attribute">
                        <span>Mahalle</span>
                        <span className="mosque-details__attribute-value">
                            {mosque.neighborhood}
                        </span>
                    </li>
                )}

                <li className="mosque-details__attribute">
                    <span>OSM</span>
                    <a
                        href={mosque.osmUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mosque-details__attribute-link"
                    >
                        #{mosque.id}
                    </a>
                </li>

                {mosque.wikidata && (
                    <li className="mosque-details__attribute">
                        <span>Wikidata</span>
                        <a
                            href={`https://www.wikidata.org/wiki/${mosque.wikidata}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mosque-details__attribute-link"
                        >
                            {mosque.wikidata}
                        </a>
                    </li>
                )}
            </ul>

            <p className="mosque-details__description">
                Noktalar, OpenStreetMap gönüllülerinin sağladığı verilere dayanır. Liste
                varsayılan olarak konumuna en yakın {listLimit} camiyi gösterir; sağdaki
                kaydırıcı ile bu sayıyı artırabilirsin.
            </p>
        </div>
    );
}
