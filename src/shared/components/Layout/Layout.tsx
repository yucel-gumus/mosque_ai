import type { ReactNode } from 'react';
import './Layout.css';

interface AppShellProps {
    /** Uygulama içeriği */
    children: ReactNode;
}

/**
 * Ana uygulama kabuğu.
 * Maksimum genişlik ve padding sağlar.
 */
export function AppShell({ children }: AppShellProps) {
    return <div className="app-shell">{children}</div>;
}

interface HeaderProps {
    /** Üst başlık (eyebrow) */
    eyebrow: string;
    /** Ana başlık */
    title: string;
    /** Alt açıklama */
    lead: string;
}

/**
 * Uygulama başlık komponenti.
 */
export function Header({ eyebrow, title, lead }: HeaderProps) {
    return (
        <header className="app-header">
            <p className="app-header__eyebrow">{eyebrow}</p>
            <h1 className="app-header__title">{title}</h1>
            <p className="app-header__lead">{lead}</p>
        </header>
    );
}
