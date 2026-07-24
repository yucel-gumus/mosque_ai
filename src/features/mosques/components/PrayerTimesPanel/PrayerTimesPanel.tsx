import { useMemo, useState, useEffect, memo } from 'react';
import type { SortedMosque } from '../../hooks/useDistanceSort';
import { useMosqueStore } from '../../store/mosqueStore';
import type { Mosque, Coordinates, PrayerTimings } from '../../types/mosque.types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Compass, Sunrise, Sun, Sunset, Moon, AlertCircle } from 'lucide-react';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';

interface PrayerTimesPanelProps {
    coords: Coordinates | null;
    selectedMosque: SortedMosque | Mosque | null;
}

const PRAYERS = [
    { key: 'fajr', label: 'İmsak', Icon: Moon },
    { key: 'sunrise', label: 'Güneş', Icon: Sunrise },
    { key: 'dhuhr', label: 'Öğle', Icon: Sun },
    { key: 'asr', label: 'İkindi', Icon: Sun },
    { key: 'maghrib', label: 'Akşam', Icon: Sunset },
    { key: 'isha', label: 'Yatsı', Icon: Moon },
] as const;

const isCurrentPrayer = (now: Date, h: number, m: number): boolean => {
    return now.getHours() === h && now.getMinutes() === m;
};

const getNextPrayerIndex = (timings: PrayerTimings | null, now: Date): number => {
    if (!timings) return -1;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const order: (keyof Omit<PrayerTimings, 'date'>)[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    for (let i = 0; i < order.length; i++) {
        const timeStr = timings[order[i]];
        if (!timeStr) continue;
        const [h, m] = timeStr.split(':').map(Number);
        const prayerMinutes = h * 60 + m;
        if (prayerMinutes > currentMinutes) return i;
    }
    return 0;
};

export const PrayerTimesPanel = memo(function PrayerTimesPanel({ coords, selectedMosque }: PrayerTimesPanelProps) {
    const { timings, isLoading, error } = usePrayerTimes(coords);
    const tileLayer = useMosqueStore((s) => s.ui.tileLayer);

    const [currentTime, setCurrentTime] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    const nextIndex = useMemo(() => getNextPrayerIndex(timings, currentTime), [timings, currentTime]);

    const locationLabel = selectedMosque
        ? `${selectedMosque.name} yakını`
        : coords
          ? 'Mevcut konumunuz'
          : 'İstanbul merkezi';

    return (
        <Card className="h-full flex flex-col rounded-3xl border-2 border-[#FFB6A6] bg-[#FFF6EC] shadow-xl">
            <CardContent className="space-y-2 p-3 sm:p-3.5">
                <div className="flex items-center justify-between border-b border-[#FFB6A6]/30 pb-1.5">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-[#4A2B20] sm:text-sm">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#9BCEC1] text-[#1A4036]">
                            <Clock className="h-3.5 w-3.5" />
                        </div>
                        Ezan Vakitleri
                    </h3>
                    {timings && (
                        <span className="text-[10px] font-bold text-[#8C5E50] bg-[#FFEBD3] px-2 py-0.5 rounded-full border border-[#FFB6A6]">
                            {timings.date}
                        </span>
                    )}
                </div>

                <p className="flex items-center gap-1.5 text-[10px] font-bold text-[#8C5E50]">
                    <Compass className="h-3 w-3 text-[#4A2B20]" />
                    {locationLabel}
                </p>

                {isLoading && (
                    <div className="grid grid-cols-2 gap-2" aria-busy="true">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-2xl bg-[#FFEBD3]" />
                        ))}
                    </div>
                )}

                {error && !isLoading && (
                    <div className="flex items-start gap-2 rounded-2xl border border-[#E06C62]/30 bg-[#E06C62]/10 p-2.5 text-xs font-bold text-[#E06C62]">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>Ezan vakitleri alınamadı: {error}</span>
                    </div>
                )}

                {!isLoading && !error && timings && (
                    <div className="grid grid-cols-2 gap-2">
                        {PRAYERS.map(({ key, label, Icon }, idx) => {
                            const time = timings[key];
                            const [h, m] = time.split(':').map(Number);
                            const isNext = idx === nextIndex;
                            return (
                                <div
                                    key={key}
                                    className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl border p-2 h-[52px] sm:h-[56px] transition-all duration-300 ${
                                        isNext
                                            ? 'bg-[#9BCEC1] border-[#7CB8AA] shadow-md text-[#1A4036] scale-[1.02]'
                                            : 'bg-[#FFEBD3]/60 border-[#FFB6A6]/50 text-[#4A2B20] hover:bg-[#FFEBD3]'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Icon className={`h-3.5 w-3.5 ${isNext ? 'text-[#1A4036]' : 'text-[#8C5E50]'}`} />
                                        <span className={`text-xs font-bold ${isNext ? 'text-[#1A4036]' : 'text-[#8C5E50]'}`}>{label}</span>
                                    </div>
                                    <span className={`font-mono text-xs sm:text-sm font-black ${isNext ? 'text-[#1A4036]' : 'text-[#4A2B20]'}`}>
                                        {time}
                                    </span>
                                    {isNext && (
                                        <span className="text-[9px] font-black text-[#1A4036] uppercase tracking-wider animate-pulse">
                                            Sıradaki
                                        </span>
                                    )}
                                    {isCurrentPrayer(currentTime, h, m) && !isNext && (
                                        <span className="text-[9px] font-bold text-[#4A2B20]">
                                            Vakit Girdi
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {tileLayer === 'satellite' && (
                    <p className="text-[9px] font-semibold text-[#8C5E50]">
                        Uydu görüntüsü Esri World Imagery servisi ile sunulmaktadır.
                    </p>
                )}
            </CardContent>
        </Card>
    );
});
