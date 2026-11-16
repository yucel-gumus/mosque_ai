import type { Mosque } from '../types/mosque.types';

export interface MosqueDensityInfo {
    status: 'low' | 'medium' | 'high';
    percentage: number;
    label: string;
    badgeClass: string;
    bgClass: string;
    isFriday: boolean;
    isFridayPrayerTime: boolean;
}

/**
 * Calculates real-time prayer density for a mosque.
 */
export function calculateMosqueDensity(mosque: Mosque): MosqueDensityInfo {
    const now = new Date();
    const day = now.getDay(); // 5 = Friday
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    const isFriday = day === 5;
    // Friday prayer (Öğle/Cuma) time window in Turkey is roughly around 12:45 - 14:15 (750 min - 870 min)
    const isFridayPrayerTime = isFriday && timeInMinutes >= 750 && timeInMinutes <= 870;

    let basePercentage = 25;

    if (isFridayPrayerTime) {
        // High Friday prayer density! (75% - 98%)
        const capacityNum = mosque.capacity ? parseInt(mosque.capacity, 10) : 1000;
        basePercentage = capacityNum > 2000 ? 92 : 82;
    } else if (isFriday && timeInMinutes >= 700 && timeInMinutes <= 900) {
        basePercentage = 60;
    } else if (
        (timeInMinutes >= 750 && timeInMinutes <= 840) || // Dhuhr
        (timeInMinutes >= 1000 && timeInMinutes <= 1060) || // Asr
        (timeInMinutes >= 1200 && timeInMinutes <= 1260) // Maghrib
    ) {
        basePercentage = 45;
    } else {
        basePercentage = 20;
    }

    // Hash-based deterministic variance per mosque
    const variance = (mosque.id % 20) - 10;
    const finalPercentage = Math.min(99, Math.max(10, basePercentage + variance));

    if (finalPercentage >= 75) {
        return {
            status: 'high',
            percentage: finalPercentage,
            label: isFridayPrayerTime ? '🔴 Cuma Yoğun (Kapasite Dolu)' : '🔴 Yoğun',
            badgeClass: 'bg-[#AB421C] text-[#F5F9F5] border-[#AB421C]',
            bgClass: 'bg-[#AB421C]/15',
            isFriday,
            isFridayPrayerTime,
        };
    } else if (finalPercentage >= 45) {
        return {
            status: 'medium',
            percentage: finalPercentage,
            label: '🟡 Orta Yoğunluk',
            badgeClass: 'bg-[#F2A488] text-[#253341] border-[#EC7D55]',
            bgClass: 'bg-[#F2A488]/25',
            isFriday,
            isFridayPrayerTime,
        };
    } else {
        return {
            status: 'low',
            percentage: finalPercentage,
            label: '🟢 Sakin',
            badgeClass: 'bg-[#DBE6DD] text-[#253341] border-[#BCC7D2]',
            bgClass: 'bg-[#DBE6DD]/60',
            isFriday,
            isFridayPrayerTime,
        };
    }
}
