import { useEffect, useState } from 'react';
import type { Coordinates, PrayerTimings } from '../types/mosque.types';
import { PRAYER_TIMES_ENDPOINT } from '../constants/mosque.constants';

interface UsePrayerTimesResult {
    timings: PrayerTimings | null;
    isLoading: boolean;
    error: string | null;
}

interface AladhanResponse {
    data: {
        timings: {
            Fajr: string;
            Sunrise: string;
            Dhuhr: string;
            Asr: string;
            Sunset: string;
            Maghrib: string;
            Isha: string;
            Imsak: string;
            Midnight: string;
        };
        date: {
            readable: string;
            gregorian: { date: string };
        };
    };
    code: number;
    status: string;
}

const formatTime = (raw: string): string => {
    // Aladhan returns "04:12 (TZ)" — strip timezone hint
    const match = raw.match(/^(\d{2}:\d{2})/);
    return match ? match[1] : raw;
};

const parseAndFormatGregorianDate = (gregorianDateStr: string): string => {
    const parts = gregorianDateStr.split('-');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }
    return gregorianDateStr;
};

export function usePrayerTimes(coords: Coordinates | null): UsePrayerTimesResult {
    const [state, setState] = useState<UsePrayerTimesResult>({
        timings: null,
        isLoading: false,
        error: null,
    });

    const lat = coords?.[0];
    const lon = coords?.[1];

    useEffect(() => {
        if (lat === undefined || lon === undefined) {
            Promise.resolve().then(() => {
                setState({ timings: null, isLoading: false, error: null });
            });
            return;
        }

        let isMounted = true;
        const controller = new AbortController();

        Promise.resolve().then(() => {
            if (isMounted) {
                setState({ timings: null, isLoading: true, error: null });
            }
        });

        const url = `${PRAYER_TIMES_ENDPOINT}?latitude=${lat}&longitude=${lon}&method=13&timeformat=24h`;

        fetch(url, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<AladhanResponse>;
            })
            .then((json) => {
                if (!isMounted) return;
                const t = json.data.timings;
                setState({
                    timings: {
                        date: parseAndFormatGregorianDate(json.data.date.gregorian.date),
                        fajr: formatTime(t.Fajr),
                        sunrise: formatTime(t.Sunrise),
                        dhuhr: formatTime(t.Dhuhr),
                        asr: formatTime(t.Asr),
                        maghrib: formatTime(t.Maghrib),
                        isha: formatTime(t.Isha),
                    },
                    isLoading: false,
                    error: null,
                });
            })
            .catch((err) => {
                if (!isMounted) return;
                if (err.name === 'AbortError') return;
                setState({
                    timings: null,
                    isLoading: false,
                    error: err.message || 'Ezan vakitleri alınamadı',
                });
            });

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [lat, lon]);

    return state;
}
