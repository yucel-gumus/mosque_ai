import { describe, it, expect } from 'vitest';
import {
    calculateDistance,
    formatDistance,
    calculateQiblaBearing,
    bearingToCompass,
    buildDirectionsUrl,
    calculateBearing,
} from '../geo.utils';

describe('calculateDistance (Haversine)', () => {
    it('aynı nokta için 0 döner', () => {
        expect(calculateDistance(41.0082, 28.9784, 41.0082, 28.9784)).toBe(0);
    });

    it('Sultanahmet → Galata yaklaşık 1.5 km', () => {
        // Sultanahmet (41.0054, 28.9768) → Galata Kulesi (41.0256, 28.9744)
        const d = calculateDistance(41.0054, 28.9768, 41.0256, 28.9744);
        expect(d).toBeGreaterThan(2200);
        expect(d).toBeLessThan(2500);
    });

    it('simetri: A→B ve B→A eşit olmalı', () => {
        const a = calculateDistance(41.0, 29.0, 41.05, 29.05);
        const b = calculateDistance(41.05, 29.05, 41.0, 29.0);
        expect(a).toBeCloseTo(b, 5);
    });
});

describe('formatDistance', () => {
    it('1000 m altı metre gösterir', () => {
        expect(formatDistance(450)).toBe('450 m');
        expect(formatDistance(0)).toBe('0 m');
    });

    it('1000 m ve üstü km gösterir (Türkçe format)', () => {
        // tr-TR locale: ondalık ayracı virgüldür
        expect(formatDistance(1500)).toBe('1,5 km');
        expect(formatDistance(7500)).toBe('7,5 km');
    });
});

describe('calculateQiblaBearing', () => {
    it('İstanbul için güneydoğu yönünde bir bearing döner (~150° civarı)', () => {
        const bearing = calculateQiblaBearing(41.0082, 28.9784);
        expect(bearing).toBeGreaterThan(140);
        expect(bearing).toBeLessThan(170);
    });

    it('0-360 aralığında döner', () => {
        const bearing = calculateQiblaBearing(0, 0);
        expect(bearing).toBeGreaterThanOrEqual(0);
        expect(bearing).toBeLessThan(360);
    });
});

describe('bearingToCompass', () => {
    it('0° → K', () => {
        expect(bearingToCompass(0)).toBe('K');
    });

    it('90° → D', () => {
        expect(bearingToCompass(90)).toBe('D');
    });

    it('180° → G', () => {
        expect(bearingToCompass(180)).toBe('G');
    });

    it('270° → B', () => {
        expect(bearingToCompass(270)).toBe('B');
    });
});

describe('buildDirectionsUrl', () => {
    it('Google Maps directions URL\'i üretir', () => {
        const url = buildDirectionsUrl(41.0, 29.0, 41.05, 29.05);
        expect(url).toContain('google.com/maps/dir');
        expect(url).toContain('origin=41');
        expect(url).toContain('destination=41.05');
        expect(url).toContain('travelmode=driving');
    });
});

describe('calculateBearing', () => {
    it('Kuzey yönü için ~0° döner', () => {
        const bearing = calculateBearing(41.0, 29.0, 41.1, 29.0);
        expect(bearing).toBeCloseTo(0, 0);
    });

    it('Doğu yönü için ~90° döner', () => {
        const bearing = calculateBearing(41.0, 29.0, 41.0, 29.1);
        expect(bearing).toBeCloseTo(90, 0);
    });

    it('Güney yönü için ~180° döner', () => {
        const bearing = calculateBearing(41.1, 29.0, 41.0, 29.0);
        expect(bearing).toBeCloseTo(180, 0);
    });

    it('Batı yönü için ~270° döner', () => {
        const bearing = calculateBearing(41.0, 29.1, 41.0, 29.0);
        expect(bearing).toBeCloseTo(270, 0);
    });
});

