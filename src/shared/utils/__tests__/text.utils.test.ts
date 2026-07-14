import { describe, it, expect } from 'vitest';
import { normalizeText } from '../text.utils';

describe('normalizeText', () => {
    it('Türkçe büyük İ ve küçük i dönüşümü', () => {
        expect(normalizeText('İstanbul')).toBe('istanbul');
        expect(normalizeText('Isparta')).toBe('isparta');
    });

    it('Türkçe karakterleri Latinize eder', () => {
        expect(normalizeText('Çağlayan')).toBe('caglayan');
        expect(normalizeText('Şişli')).toBe('sisli');
        expect(normalizeText('Güngören')).toBe('gungoren');
        expect(normalizeText('Ömer')).toBe('omer');
        expect(normalizeText('Üsküdar')).toBe('uskudar');
    });

    it('boş string için boş döner', () => {
        expect(normalizeText('')).toBe('');
    });
});
