import { useEffect, useRef } from 'react';
import { useMosqueStore } from '../../store/mosqueStore';
import { useOpenAIChat } from '../../hooks/useOpenAIChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sparkles, X, Send, Bot, User as UserIcon, AlertCircle } from 'lucide-react';
import type { Mosque, Coordinates } from '../../types/mosque.types';
import type { SortedMosque } from '../../hooks/useDistanceSort';

interface AIAssistantProps {
    selectedMosque: Mosque | null;
    userCoords: Coordinates | null;
    closestMosques: SortedMosque[];
}

const SUGGESTED_QUESTIONS = [
    'Bu caminin tarihi hakkında bilgi verir misin?',
    'Yakınlarda ibadete açık cami var mı?',
    'Namaz vakitlerini öğrenebilir miyim?',
    'Camilerde engelli erişimi nasıl sağlanır?',
];

export function AIAssistant({ selectedMosque, userCoords, closestMosques }: AIAssistantProps) {
    const open = useMosqueStore((s) => s.ui.assistantOpen);
    const toggle = useMosqueStore((s) => s.toggleAssistant);
    const { messages, isSending, error, send, clear } = useOpenAIChat({
        selectedMosque,
        userCoords,
        closestMosques,
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    useEffect(() => {
        // Auto-scroll to bottom on new message
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages.length]);

    return (
        <>
            <Button
                onClick={toggle}
                size="icon"
                className={`fixed bottom-4 left-4 z-[1100] h-12 w-12 rounded-full shadow-lg transition-all duration-300 ease-out ai-float-btn ${
                    open
                        ? 'pointer-events-none scale-50 opacity-0'
                        : 'pointer-events-auto scale-100 opacity-100'
                }`}
                title="Cami Asistanı"
            >
                <Sparkles className="h-5 w-5" />
            </Button>

            <Card
                className={`fixed bottom-4 left-4 z-[1100] flex h-[500px] w-[calc(100vw-2rem)] max-w-[340px] flex-col shadow-2xl transition-all duration-300 ease-out origin-bottom-left sm:left-4 sm:w-[340px] ${
                    open
                        ? 'pointer-events-auto scale-100 opacity-100'
                        : 'pointer-events-none scale-95 opacity-0'
                }`}
                aria-label="Cami Asistanı sohbet paneli"
            >
            <div className="flex items-center justify-between border-b p-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Cami Asistanı</h3>
                        <p className="text-[10px] text-muted-foreground">
                            {selectedMosque ? `${selectedMosque.name} ile ilgili` : 'Genel'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clear} className="h-7 text-xs">
                            Temizle
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={toggle} className="h-7 w-7">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div ref={listRef} aria-live="polite" role="log" className="flex-1 space-y-2 overflow-y-auto p-3">
                {messages.length === 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                            Merhaba! İstanbul camileri, namaz vakitleri veya caminin tarihi hakkında sorularınızı yanıtlayabilirim.
                        </p>
                        <div className="space-y-1.5">
                            {SUGGESTED_QUESTIONS.map((q) => (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => send(q)}
                                    className="block w-full rounded-md border border-dashed p-2 text-left text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}
                        >
                            {msg.role === 'user' ? (
                                <UserIcon className="h-3 w-3" />
                            ) : (
                                <Bot className="h-3 w-3" />
                            )}
                        </div>
                        <div
                            className={`max-w-[80%] rounded-lg p-2 text-xs whitespace-pre-line leading-relaxed ${
                                msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-foreground'
                            }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isSending && (
                    <div className="flex gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                            <Bot className="h-3 w-3" />
                        </div>
                        <div className="rounded-lg bg-muted p-2 text-xs text-muted-foreground">
                            <span className="inline-flex gap-1">
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                                <span
                                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-current"
                                    style={{ animationDelay: '0.15s' }}
                                />
                                <span
                                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-current"
                                    style={{ animationDelay: '0.3s' }}
                                />
                            </span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-2 text-[11px] text-destructive">
                        <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const message = formData.get('message') as string;
                    if (message.trim()) {
                        send(message);
                        e.currentTarget.reset();
                    }
                }}
                className="flex gap-2 border-t p-3"
            >
                <Input
                    ref={inputRef}
                    name="message"
                    placeholder="Bir soru sorun..."
                    disabled={isSending}
                    className="h-9 text-sm"
                />
                <Button type="submit" size="icon" disabled={isSending} className="h-9 w-9 shrink-0">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
            </Card>
        </>
    );
}
