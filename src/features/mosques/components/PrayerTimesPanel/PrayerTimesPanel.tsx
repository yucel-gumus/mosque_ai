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
    return 0; // After yatsı, next prayer is Fajr tomorrow
};

export const PrayerTimesPanel = memo(function PrayerTimesPanel({ coords, selectedMosque }: PrayerTimesPanelProps) {
    const { timings, isLoading, error } = usePrayerTimes(coords);
    const tileLayer = useMosqueStore((s) => s.ui.tileLayer);

    const [currentTime, setCurrentTime] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000); // update every 30 seconds
        return () => clearInterval(timer);
    }, []);

    const nextIndex = useMemo(() => getNextPrayerIndex(timings, currentTime), [timings, currentTime]);

    const locationLabel = selectedMosque
        ? `${selectedMosque.name} yakını`
        : coords
          ? 'Mevcut konumunuz'
          : 'İstanbul merkezi';

    return (
        <Card className="h-full flex flex-col">
            <CardContent className="space-y-1.5 p-2 sm:p-2.5">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
                        <Clock className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                        Ezan Vakitleri
                    </h3>
                    {timings && (
                        <span className="text-[9px] text-muted-foreground sm:text-[10px]">
                            {timings.date}
                        </span>
                    )}
                </div>

                <p className="flex items-center gap-1 text-[9px] text-muted-foreground sm:text-[10px]">
                    <Compass className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {locationLabel}
                </p>

                {isLoading && (
                    <div className="grid grid-cols-3 gap-1.5" aria-busy="true">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full rounded-lg sm:h-12" />
                        ))}
                    </div>
                )}

                {error && !isLoading && (
                    <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-2 text-[11px] text-destructive sm:text-xs">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>Ezan vakitleri alınamadı: {error}</span>
                    </div>
                )}

                {!isLoading && !error && timings && (
                    <div className="grid grid-cols-3 gap-1.5">
                        {PRAYERS.map(({ key, label, Icon }, idx) => {
                            const time = timings[key];
                            const [h, m] = time.split(':').map(Number);
                            const isNext = idx === nextIndex;
                            return (
                                <div
                                    key={key}
                                    className={`flex flex-col items-center justify-center gap-0.5 rounded-lg border p-1 h-[46px] sm:h-[50px] transition-all duration-300 ${
                                        isNext
                                            ? 'active-prayer-box scale-[1.02]'
                                            : 'border-border/60 bg-card/45 hover:bg-card hover:border-border hover:shadow-xs'
                                    }`}
                                >
                                    <div className="flex items-center gap-1">
                                        <Icon className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${isNext ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className={`text-[9px] font-medium sm:text-[10px] ${isNext ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                                    </div>
                                    <span className={`font-mono text-[11px] font-bold sm:text-xs ${isNext ? 'text-primary' : 'text-foreground'}`}>
                                        {time}
                                    </span>
                                    {isNext && (
                                        <span className="text-[9px] font-medium text-primary sm:text-[10px] animate-pulse">
                                            Sıradaki
                                        </span>
                                    )}
                                    {isCurrentPrayer(currentTime, h, m) && !isNext && (
                                        <span className="text-[9px] font-medium text-primary sm:text-[10px]">
                                            Şimdi
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {tileLayer === 'satellite' && (
                    <p className="text-[9px] text-muted-foreground">
                        Uydu görüntüsü için Esri World Imagery kullanılmıştır.
                    </p>
                )}
            </CardContent>
        </Card>
    );
});
