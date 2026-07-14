import type { ReactNode } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { Button } from '@/components/ui/button';

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-background/50 text-foreground transition-colors duration-300 relative">
            {/* Ambient background glow for a premium feel */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-[30%] -left-[10%] h-[70%] w-[50%] rounded-full bg-primary/5 blur-[120px] dark:bg-primary/2" />
                <div className="absolute -right-[10%] top-[10%] h-[60%] w-[40%] rounded-full bg-accent/20 blur-[100px] dark:bg-accent/5" />
            </div>
            <div id="main-content" className="container mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6 xl:px-8">
                {children}
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

export function Header({ eyebrow, title, lead, children }: HeaderProps) {
    const darkMode = useThemeStore((s) => s.darkMode);
    const setDarkMode = useThemeStore((s) => s.setDarkMode);

    return (
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between lg:mb-10">
            <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary border border-primary/10">
                    <span className="text-sm">🕌</span> {eyebrow}
                </div>
                {title && (
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                        {title}
                    </h1>
                )}
                {lead && (
                    <p className="max-w-3xl text-xs text-muted-foreground sm:text-sm lg:text-base font-normal">
                        {lead}
                    </p>
                )}
                {children}
            </div>

            <div className="flex items-center gap-1 self-start rounded-full border bg-card/85 backdrop-blur-sm p-1 shadow-sm sm:self-auto transition-all">
                <Button
                    variant={darkMode === 'light' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8 rounded-full transition-all"
                    onClick={() => setDarkMode('light')}
                    title="Açık Tema"
                >
                    <Sun className="h-4 w-4" />
                </Button>
                <Button
                    variant={darkMode === 'dark' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8 rounded-full transition-all"
                    onClick={() => setDarkMode('dark')}
                    title="Karanlık Tema"
                >
                    <Moon className="h-4 w-4" />
                </Button>
                <Button
                    variant={darkMode === 'system' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8 rounded-full transition-all"
                    onClick={() => setDarkMode('system')}
                    title="Sistem Teması"
                >
                    <Laptop className="h-4 w-4" />
                </Button>
            </div>
        </header>
    );
}
