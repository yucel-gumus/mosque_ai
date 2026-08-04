import type { ReactNode } from 'react';

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-[#FFEBD3] text-[#4A2B20] transition-colors duration-300 relative">
            {/* Ambient background glow using 60-30-10 colors */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-[30%] -left-[10%] h-[70%] w-[50%] rounded-full bg-[#FFB6A6]/20 blur-[120px]" />
                <div className="absolute -right-[10%] top-[10%] h-[60%] w-[40%] rounded-full bg-[#9BCEC1]/25 blur-[100px]" />
            </div>
            <div id="main-content" className="container mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6 xl:px-8 flex flex-col min-h-screen">
                <div className="flex-1">
                    {children}
                </div>
                <footer className="mt-8 py-3 text-center text-xs opacity-75 border-t border-[#4A2B20]/10">
                    <p>Geliştirici: <a href="https://www.yucelgumus.dev/" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:opacity-100">Yücel Gümüş</a></p>
                </footer>
            </div>
        </div>
    );
}

interface HeaderProps {
    eyebrow: string;
    title?: string;
    lead?: string;
    children?: ReactNode;
}

export function Header({ eyebrow, title, children }: HeaderProps) {
    return (
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2.5 sm:mb-4">
            <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 font-black text-base sm:text-lg text-[#4A2B20]">
                    <span className="text-base">🕌</span>
                    <h2>{title || eyebrow}</h2>
                </div>
                {children}
            </div>
        </header>
    );
}
