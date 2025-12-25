import type { ReactNode } from 'react';
import './StatusCard.css';

interface StatusCardProps {
    /** Kart içeriği */
    children: ReactNode;
    /** Kart varyantı */
    variant?: 'default' | 'error';
    /** Aksiyon butonu (opsiyonel) */
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Durum kartı komponenti.
 *
 * @description
 * Yükleniyor, hata ve bilgi mesajları için kullanılır.
 * Opsiyonel aksiyon butonu içerir.
 *
 * @example
 * ```tsx
 * <StatusCard variant="error" action={{ label: 'Tekrar dene', onClick: refetch }}>
 *   <p><strong>API hatası:</strong> {error}</p>
 * </StatusCard>
 * ```
 */
export function StatusCard({
    children,
    variant = 'default',
    action,
}: StatusCardProps) {
    const className = `status-card ${variant === 'error' ? 'status-card--error' : ''}`;

    return (
        <div className={className}>
            <div className="status-card__content">{children}</div>
            {action && (
                <button
                    type="button"
                    className="status-card__btn"
                    onClick={action.onClick}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
