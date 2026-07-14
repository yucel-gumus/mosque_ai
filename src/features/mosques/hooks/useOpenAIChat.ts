import { useCallback, useRef, useState } from 'react';
import type { ChatMessage, Mosque, Coordinates } from '../types/mosque.types';
import { usePrayerTimes } from './usePrayerTimes';
import type { SortedMosque } from './useDistanceSort';
import { useMosqueStore } from '../store/mosqueStore';
import { fetchRoute } from '../utils/geo.utils';

interface UseOpenAIChatOptions {
    selectedMosque: Mosque | null;
    userCoords: Coordinates | null;
    closestMosques: SortedMosque[];
    apiKey?: string; // Left for compatibility
}

interface UseOpenAIChatResult {
    messages: ChatMessage[];
    isSending: boolean;
    error: string | null;
    send: (userMessage: string) => Promise<void>;
    clear: () => void;
}

export function useOpenAIChat({ selectedMosque, userCoords, closestMosques }: UseOpenAIChatOptions): UseOpenAIChatResult {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Persistent session ID for the chat session, refreshes when clear() is called
    const sessionIdRef = useRef<string>(crypto.randomUUID());
    const abortRef = useRef<AbortController | null>(null);

    const selectMosqueStore = useMosqueStore((s) => s.selectMosque);
    const setRoute = useMosqueStore((s) => s.setRoute);
    const setIsLoadingRoute = useMosqueStore((s) => s.setIsLoadingRoute);
    const setRouteError = useMosqueStore((s) => s.setRouteError);

    const { timings } = usePrayerTimes(selectedMosque ? [selectedMosque.lat, selectedMosque.lon] : null);

    const clear = useCallback(() => {
        setMessages([]);
        setError(null);
        sessionIdRef.current = crypto.randomUUID();
        if (abortRef.current) abortRef.current.abort();
    }, []);

    const send = useCallback(
        async (userMessage: string) => {
            const trimmed = userMessage.trim();
            if (!trimmed) return;

            setError(null);
            setIsSending(true);

            // Append user message immediately
            const userMsgId = crypto.randomUUID();
            const updatedMessages: ChatMessage[] = [
                ...messages,
                { id: userMsgId, role: 'user', content: trimmed },
            ];
            setMessages(updatedMessages);

            const controller = new AbortController();
            abortRef.current = controller;

            // Generate temporary assistant message for streaming
            const assistantMsgId = crypto.randomUUID();
            setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

            try {
                const bffUrl = `${
                    (import.meta.env.VITE_BFF_API_URL as string | undefined)?.replace(/\/$/, '') || 'https://pages-bff.vercel.app'
                }/api/mosque/chat`;

                const response = await fetch(bffUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: trimmed,
                        session_id: sessionIdRef.current,
                        selected_mosque: selectedMosque ? {
                            id: selectedMosque.id,
                            name: selectedMosque.name,
                            lat: selectedMosque.lat,
                            lon: selectedMosque.lon,
                            district: selectedMosque.district,
                            neighborhood: selectedMosque.neighborhood,
                            website: selectedMosque.website,
                            capacity: selectedMosque.capacity,
                            wheelchair: selectedMosque.wheelchair,
                            architect: selectedMosque.architect
                        } : null,
                        user_coords: userCoords ? {
                            latitude: userCoords[0],
                            longitude: userCoords[1]
                        } : null,
                        closest_mosques: closestMosques.slice(0, 5).map(m => ({
                            id: m.id,
                            name: m.name,
                            district: m.district,
                            neighborhood: m.neighborhood,
                            distance: m.distance,
                            lat: m.lat,
                            lon: m.lon
                        })),
                        prayer_timings: timings ? {
                            date: timings.date,
                            fajr: timings.fajr,
                            sunrise: timings.sunrise,
                            dhuhr: timings.dhuhr,
                            asr: timings.asr,
                            maghrib: timings.maghrib,
                            isha: timings.isha
                        } : null
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Asistan Sunucusu Hatası (${response.status}): ${text.slice(0, 200)}`);
                }

                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('Streaming response is not supported by your browser.');
                }

                const decoder = new TextDecoder('utf-8');
                let buffer = '';
                let accumulatedContent = '';

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        const cleanLine = line.trim();
                        if (!cleanLine.startsWith('data:')) continue;

                        const dataStr = cleanLine.substring(5).trim();
                        if (!dataStr) continue;

                        try {
                            const payload = JSON.parse(dataStr);
                            
                            if (payload.type === 'text' && payload.content) {
                                accumulatedContent += payload.content;
                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === assistantMsgId
                                            ? { ...msg, content: accumulatedContent }
                                            : msg
                                    )
                                );
                            } else if (payload.type === 'function_call') {
                                const { name, args } = payload;
                                
                                if (name === 'select_mosque' && args.id) {
                                    selectMosqueStore(args.id);
                                } else if (name === 'show_route_to_mosque' && args.id) {
                                    const mosqueId = args.id;
                                    if (!userCoords) {
                                        setError('Yol tarifi için konum izni gereklidir.');
                                        continue;
                                    }
                                    
                                    let target: { lat: number; lon: number; name: string } | undefined = closestMosques.find(m => m.id === mosqueId);
                                    if (!target && selectedMosque && selectedMosque.id === mosqueId) {
                                        target = selectedMosque;
                                    }
                                    
                                    if (target) {
                                        selectMosqueStore(mosqueId);
                                        setIsLoadingRoute(true);
                                        setRouteError(null);
                                        try {
                                            const coords = await fetchRoute(userCoords, [target.lat, target.lon]);
                                            setRoute(coords);
                                        } catch (err) {
                                            const errMsg = err instanceof Error ? err.message : 'Bilinmeyen hata';
                                            setRouteError(errMsg);
                                        } finally {
                                            setIsLoadingRoute(false);
                                        }
                                    }
                                }
                            } else if (payload.type === 'error') {
                                throw new Error(payload.message || 'Bilinmeyen asistan hatası.');
                            }
                        } catch (e) {
                            console.error('SSE parser error:', e, cleanLine);
                        }
                    }
                }
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return;
                const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
                setError(message);
                
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantMsgId
                            ? { ...msg, content: `Üzgünüm, bir sorun oluştu: ${message}` }
                            : msg
                    )
                );
            } finally {
                setIsSending(false);
                abortRef.current = null;
            }
        },
        [
            messages,
            selectedMosque,
            timings,
            userCoords,
            closestMosques,
            selectMosqueStore,
            setRoute,
            setIsLoadingRoute,
            setRouteError,
        ]
    );

    return { messages, isSending, error, send, clear };
}
