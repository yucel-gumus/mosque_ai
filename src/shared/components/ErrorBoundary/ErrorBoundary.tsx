import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-[400px] items-center justify-center p-8">
                    <Card className="max-w-md text-center">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <CardTitle>Bir şeyler yanlış gitti</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground">
                            <p>
                                Uygulama beklenmedik bir hatayla karşılaştı. Lütfen sayfayı
                                yenileyin veya aşağıdaki butona tıklayın.
                            </p>
                            {this.state.error && (
                                <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-3 text-left text-xs text-destructive">
                                    {this.state.error.message}
                                </pre>
                            )}
                        </CardContent>
                        <CardFooter className="justify-center">
                            <Button onClick={this.handleReset}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Tekrar Dene
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
