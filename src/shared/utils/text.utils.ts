/**
 * Normalizes Turkish text for search operations by removing diacritics and converting to lowercase.
 *
 * @param text - The text to normalize
 * @returns Normalized text without diacritics and in lowercase
 *
 * @example
 * ```typescript
 * normalizeText('İstanbul') // 'istanbul'
 * normalizeText('Çağlayan') // 'caglayan'
 * ```
 */
export const normalizeText = (text: string): string => {
    return text
        .toLocaleLowerCase('tr-TR')
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
};
