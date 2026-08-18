import { describe, it, expect } from 'vitest';
import { isRamadanActive, getRamadanCountdown } from '../ramadan.utils';

describe('ramadan.utils', () => {
    describe('isRamadanActive', () => {
        it('Ramazan 2024 tarihlerinde true döner (11 Mart - 9 Nisan 2024)', () => {
            expect(isRamadanActive(new Date(2024, 2, 11))).toBe(true);
            expect(isRamadanActive(new Date(2024, 2, 25))).toBe(true);
            expect(isRamadanActive(new Date(2024, 3, 9))).toBe(true);
        });

        it('Ramazan 2025 tarihlerinde true döner (1 Mart - 29 Mart 2025)', () => {
            expect(isRamadanActive(new Date(2025, 2, 1))).toBe(true);
            expect(isRamadanActive(new Date(2025, 2, 15))).toBe(true);
            expect(isRamadanActive(new Date(2025, 2, 29))).toBe(true);
        });

        it('Ramazan 2026 tarihlerinde true döner (18 Şubat - 19 Mart 2026)', () => {
            expect(isRamadanActive(new Date(2026, 1, 18))).toBe(true);
            expect(isRamadanActive(new Date(2026, 2, 1))).toBe(true);
            expect(isRamadanActive(new Date(2026, 2, 19))).toBe(true);
        });

        it('Ramazan ayı dışındaki tarihlerde false döner', () => {
            expect(isRamadanActive(new Date(2024, 2, 10))).toBe(false); // 10 Mart 2024 (Ramazan öncesi)
            expect(isRamadanActive(new Date(2024, 3, 10))).toBe(false); // 10 Nisan 2024 (Bayram 1. gün)
            expect(isRamadanActive(new Date(2025, 1, 28))).toBe(false); // 28 Şubat 2025
            expect(isRamadanActive(new Date(2025, 2, 30))).toBe(false); // 30 Mart 2025
            expect(isRamadanActive(new Date(2026, 7, 18))).toBe(false); // 18 Ağustos 2026
            expect(isRamadanActive(new Date(2026, 11, 25))).toBe(false); // 25 Aralık 2026
        });
    });

    describe('getRamadanCountdown', () => {
        it('formatlı ve doğru hedef etkinlik nesnesi döner', () => {
            const result = getRamadanCountdown('05:00', '20:00');
            expect(result).toHaveProperty('targetEvent');
            expect(['İftar', 'Sahur']).toContain(result.targetEvent);
            expect(result).toHaveProperty('formattedTime');
            expect(result.formattedTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
            expect(result.hours).toBeGreaterThanOrEqual(0);
            expect(result.minutes).toBeGreaterThanOrEqual(0);
            expect(result.seconds).toBeGreaterThanOrEqual(0);
        });
    });
});
