import { type ChangeEvent, useState, useCallback } from 'react';
import { DEFAULT_QUERY_BODY } from '../../constants/mosque.constants';
import './QueryEditor.css';

interface QueryEditorProps {
    /** Mevcut aktif sorgu */
    currentQuery: string;
    /** Yükleniyor durumu */
    isLoading: boolean;
    /** Sorgu uygulandığında çağrılır */
    onApply: (query: string) => void;
}

/**
 * Overpass API sorgu editörü.
 *
 * @description
 * Kullanıcının Overpass QL sorgusu yazmasına ve uygulamasına imkan tanır.
 * Varsayılan sorguya sıfırlama özelliği içerir.
 */
export function QueryEditor({
    currentQuery,
    isLoading,
    onApply,
}: QueryEditorProps) {
    const [draft, setDraft] = useState(currentQuery);

    const hasChanges = draft !== currentQuery;
    const isDefault = draft === DEFAULT_QUERY_BODY;

    const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        setDraft(e.target.value);
    }, []);

    const handleApply = useCallback(() => {
        const normalized = draft.trim() || DEFAULT_QUERY_BODY;
        setDraft(normalized);
        onApply(normalized);
    }, [draft, onApply]);

    const handleReset = useCallback(() => {
        setDraft(DEFAULT_QUERY_BODY);
        onApply(DEFAULT_QUERY_BODY);
    }, [onApply]);

    return (
        <section className="query-editor">
            <label htmlFor="overpass-query" className="query-editor__label">
                Overpass API sorgu bloğu (İstanbul sınırları otomatik eklenir)
            </label>

            <textarea
                id="overpass-query"
                className="query-editor__textarea"
                value={draft}
                onChange={handleTextChange}
                spellCheck={false}
                rows={6}
            />

            <div className="query-editor__actions">
                <button
                    type="button"
                    className="query-editor__btn"
                    onClick={handleApply}
                    disabled={isLoading || !draft.trim() || !hasChanges}
                >
                    Sorguyu uygula
                </button>

                <button
                    type="button"
                    className="query-editor__btn query-editor__btn--secondary"
                    onClick={handleReset}
                    disabled={isDefault}
                >
                    Varsayılan sorgu
                </button>

                <small className="query-editor__hint">
                    Gönderilen istek İstanbul il sınırıyla sarılır. Dilerseniz ekstra filtreler
                    ekleyebilirsiniz.
                </small>
            </div>
        </section>
    );
}
