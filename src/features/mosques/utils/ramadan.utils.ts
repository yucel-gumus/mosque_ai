export interface RamadanCountdown {
    targetEvent: 'İftar' | 'Sahur';
    hours: number;
    minutes: number;
    seconds: number;
    formattedTime: string;
    targetTimeStr: string;
}

/**
 * Known Ramadan intervals (inclusive) for Turkey / Diyanet calendar (2024 - 2035).
 */
export const RAMADAN_RANGES: [string, string][] = [
    ['2024-03-11', '2024-04-09'],
    ['2025-03-01', '2025-03-29'],
    ['2026-02-18', '2026-03-19'],
    ['2027-02-08', '2027-03-09'],
    ['2028-01-28', '2028-02-26'],
    ['2029-01-16', '2029-02-14'],
    ['2030-01-06', '2030-02-04'],
    ['2030-12-26', '2031-01-24'],
    ['2031-12-15', '2032-01-13'],
    ['2032-12-04', '2033-01-02'],
    ['2033-11-23', '2033-12-22'],
    ['2034-11-12', '2034-12-11'],
    ['2035-11-02', '2035-12-01'],
];

/**
 * Checks whether a given date is within the holy month of Ramadan (9th month of Hijri calendar).
 */
export function isRamadanActive(date: Date = new Date()): boolean {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    for (const [start, end] of RAMADAN_RANGES) {
        if (dateStr >= start && dateStr <= end) {
            return true;
        }
    }

    try {
        const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric' }).formatToParts(date);
        const monthPart = parts.find((p) => p.type === 'month');
        if (monthPart && parseInt(monthPart.value, 10) === 9) {
            return true;
        }
    } catch {
        // Fallback in environments where islamic-umalqura is unavailable
    }

    return false;
}

/**
 * Calculates live countdown to Iftar (Maghrib) or Sahur (Fajr).
 */
export function getRamadanCountdown(fajrTime: string = '05:32', maghribTime: string = '20:18'): RamadanCountdown {
    const now = new Date();

    const [fajrH, fajrM] = fajrTime.split(':').map(Number);
    const [maghribH, maghribM] = maghribTime.split(':').map(Number);

    const fajrDate = new Date(now);
    fajrDate.setHours(fajrH, fajrM, 0, 0);

    const maghribDate = new Date(now);
    maghribDate.setHours(maghribH, maghribM, 0, 0);

    let targetDate: Date;
    let targetEvent: 'İftar' | 'Sahur';
    let targetTimeStr: string;

    if (now < fajrDate) {
        // Countdown to Sahur (today's Fajr)
        targetDate = fajrDate;
        targetEvent = 'Sahur';
        targetTimeStr = fajrTime;
    } else if (now < maghribDate) {
        // Countdown to Iftar (today's Maghrib)
        targetDate = maghribDate;
        targetEvent = 'İftar';
        targetTimeStr = maghribTime;
    } else {
        // Countdown to tomorrow's Sahur
        const tomorrowFajr = new Date(fajrDate);
        tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
        targetDate = tomorrowFajr;
        targetEvent = 'Sahur';
        targetTimeStr = fajrTime;
    }

    const diffMs = Math.max(0, targetDate.getTime() - now.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    return {
        targetEvent,
        hours,
        minutes,
        seconds,
        formattedTime,
        targetTimeStr,
    };
}
