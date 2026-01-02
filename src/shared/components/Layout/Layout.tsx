import type { ReactNode } from 'react';

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </div>
        </div>
    );
}

interface HeaderProps {
    eyebrow: string;
    title: string;
    lead: string;
}

export function Header({ eyebrow, title, lead }: HeaderProps) {
    return (
        <header className="mb-8 space-y-4">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
                {eyebrow}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
            </h1>
            <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
                {lead}
            </p>
        </header>
    );
}
