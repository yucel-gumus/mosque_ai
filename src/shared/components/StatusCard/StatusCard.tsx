import type { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Info } from 'lucide-react';

interface StatusCardProps {
    children: ReactNode;
    variant?: 'default' | 'error';
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function StatusCard({ children, variant = 'default', action }: StatusCardProps) {
    const Icon = variant === 'error' ? AlertCircle : Info;

    return (
        <Alert variant={variant === 'error' ? 'destructive' : 'default'} className="my-6">
            <Icon className="h-4 w-4" />
            <AlertTitle>{variant === 'error' ? 'Hata' : 'Bilgi'}</AlertTitle>
            <AlertDescription className="mt-2">
                {children}
                {action && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={action.onClick}
                        className="mt-3"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {action.label}
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
}
