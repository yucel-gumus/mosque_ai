export interface RamadanCountdown {
    targetEvent: 'İftar' | 'Sahur';
    hours: number;
    minutes: number;
    seconds: number;
    formattedTime: string;
    targetTimeStr: string;
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
