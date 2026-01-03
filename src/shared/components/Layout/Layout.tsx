import type { ReactNode } from 'react';

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6 xl:px-8">
                {children}
            </div>
        </div>
    );
}

interface HeaderProps {
    eyebrow: string;
    title?: string;
    lead?: string;
}

export function Header({ eyebrow, title, lead }: HeaderProps) {
    return (
        <header className="mb-4 space-y-2 sm:mb-6 sm:space-y-3 lg:mb-8 lg:space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-primary sm:text-sm">
                {eyebrow}
            </p>
            {title && (
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                    {title}
                </h1>
            )}
            {lead && (
                <p className="max-w-3xl text-sm text-muted-foreground sm:text-base lg:text-lg">
                    {lead}
                </p>
            )}
        </header>
    );
}
