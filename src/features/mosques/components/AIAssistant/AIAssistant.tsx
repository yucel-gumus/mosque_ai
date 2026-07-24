import { useEffect, useRef } from 'react';
import { useMosqueStore } from '../../store/mosqueStore';
import { useMosqueChat } from '../../hooks/useMosqueChat';
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
    const { messages, isSending, error, send, clear } = useMosqueChat({
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
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages.length]);

    return (
        <>
            <Button
                onClick={toggle}
                size="icon"
                className={`fixed bottom-4 left-4 z-[1100] h-13 w-13 rounded-full border-2 border-[#FFF6EC] shadow-2xl transition-all duration-300 ease-out ai-float-btn ${open
                    ? 'pointer-events-none scale-50 opacity-0'
                    : 'pointer-events-auto scale-100 opacity-100'
                    }`}
                title="KENSAI"
            >
                <Sparkles className="h-6 w-6 text-[#1A4036]" />
            </Button>

            <Card
                className={`fixed bottom-4 left-4 z-[1100] flex h-[520px] w-[calc(100vw-2rem)] max-w-[360px] flex-col rounded-3xl border-2 border-[#FFB6A6] bg-[#FFF6EC] shadow-2xl transition-all duration-300 ease-out origin-bottom-left sm:left-4 sm:w-[360px] ${open
                    ? 'pointer-events-auto scale-100 opacity-100'
                    : 'pointer-events-none scale-95 opacity-0'
                    }`}
                aria-label="KENSAI sohbet paneli"
            >
                <div className="flex items-center justify-between border-b border-[#FFB6A6]/40 bg-[#FFB6A6]/20 p-3.5 rounded-t-3xl">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9BCEC1] shadow-sm">
                            <Sparkles className="h-4 w-4 text-[#1A4036]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#4A2B20]">KENSAI</h3>
                            <p className="text-[10px] font-semibold text-[#8C5E50]">
                                {selectedMosque ? `${selectedMosque.name} Odaklı` : 'Genel Rehber'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {messages.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clear}
                                className="h-7 text-xs font-bold text-[#4A2B20] hover:bg-[#FFB6A6]/30"
                            >
                                Temizle
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggle}
                            className="h-7 w-7 rounded-full text-[#4A2B20] hover:bg-[#FFB6A6]/30"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div ref={listRef} aria-live="polite" role="log" className="flex-1 space-y-3 overflow-y-auto p-3.5 bg-[#FFEBD3]/40">
                    {messages.length === 0 && (
                        <div className="space-y-3 p-1">
                            <p className="text-xs font-medium text-[#4A2B20] leading-relaxed">
                                Merhaba! İstanbul camileri, namaz vakitleri veya camilerin tarihi hakkında sorularınızı yanıtlayabilirim.
                            </p>
                            <div className="space-y-2">
                                {SUGGESTED_QUESTIONS.map((q) => (
                                    <button
                                        key={q}
                                        type="button"
                                        onClick={() => send(q)}
                                        className="block w-full rounded-2xl border border-[#FFB6A6] bg-[#FFF6EC] p-2.5 text-left text-xs font-semibold text-[#4A2B20] shadow-sm transition-all hover:bg-[#9BCEC1]/30 hover:border-[#9BCEC1]"
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
                            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm ${msg.role === 'user' ? 'bg-[#9BCEC1] text-[#1A4036]' : 'bg-[#FFB6A6] text-[#4A2B20]'
                                    }`}
                            >
                                {msg.role === 'user' ? (
                                    <UserIcon className="h-3.5 w-3.5" />
                                ) : (
                                    <Bot className="h-3.5 w-3.5" />
                                )}
                            </div>
                            <div
                                className={`max-w-[82%] rounded-2xl p-3 text-xs whitespace-pre-line leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-[#9BCEC1] text-[#1A4036] font-semibold'
                                    : 'bg-[#FFF6EC] text-[#4A2B20] border border-[#FFB6A6]/50 font-medium'
                                    }`}
                            >
                                {msg.content || (
                                    <span className="inline-flex gap-1.5 py-1">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#1A4036]" />
                                        <span
                                            className="h-2 w-2 animate-bounce rounded-full bg-[#1A4036]"
                                            style={{ animationDelay: '0.15s' }}
                                        />
                                        <span
                                            className="h-2 w-2 animate-bounce rounded-full bg-[#1A4036]"
                                            style={{ animationDelay: '0.3s' }}
                                        />
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {error && (
                        <div className="flex items-start gap-2 rounded-xl border border-[#E06C62]/40 bg-[#E06C62]/10 p-2.5 text-xs font-semibold text-[#E06C62]">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
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
                    className="flex gap-2 border-t border-[#FFB6A6]/40 bg-[#FFF6EC] p-3 rounded-b-3xl"
                >
                    <Input
                        ref={inputRef}
                        name="message"
                        placeholder="Bir soru sorun..."
                        disabled={isSending}
                        className="h-10 rounded-2xl border-[#FFB6A6] bg-[#FFEBD3]/50 text-xs font-medium text-[#4A2B20] focus-visible:ring-[#9BCEC1]"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isSending}
                        className="h-10 w-10 shrink-0 rounded-2xl bg-[#9BCEC1] text-[#1A4036] hover:bg-[#9BCEC1]/80 shadow-md"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </Card>
        </>
    );
}
