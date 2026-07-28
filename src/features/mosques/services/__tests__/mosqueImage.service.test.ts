import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    fetchWikipediaMosqueImage,
    fetchDirectedStreetView,
    getMosqueImage,
    clearMosqueImageCache,
    buildMosquePhotoStreamUrl,
} from '../mosqueImage.service';
import type { Mosque } from '../../types/mosque.types';

const sampleMosque: Mosque = {
    id: 101,
    name: 'Çinili Camii',
    lat: 41.0227,
    lon: 29.0203,
    district: 'Üsküdar',
    neighborhood: 'Çinili',
    osmUrl: 'https://www.openstreetmap.org/node/101',
};

describe('mosqueImage.service', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        sessionStorage.clear();
        clearMosqueImageCache();
    });

    describe('fetchWikipediaMosqueImage', () => {
        it('Wikipedia API başarıyla görsel döndüğünde URL döner', async () => {
            const mockResponse = {
                query: {
                    pages: {
                        '12345': {
                            thumbnail: {
                                source: 'https://upload.wikimedia.org/cinili_camii.jpg',
                            },
                        },
                    },
                },
            };

            vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await fetchWikipediaMosqueImage('Çinili Camii');
            expect(result).toBe('https://upload.wikimedia.org/cinili_camii.jpg');
        });

        it('Görsel olmadığında null döner', async () => {
            vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
                ok: true,
                json: async () => ({ query: { pages: { '-1': {} } } }),
            } as Response);

            const result = await fetchWikipediaMosqueImage('Bilinmeyen Cami 99');
            expect(result).toBeNull();
        });
    });

    describe('fetchDirectedStreetView (disabled client-side)', () => {
        it('never builds Google URLs with API keys in the browser', async () => {
            const res = await fetchDirectedStreetView(41.0227, 29.0203, 'TEST_API_KEY');
            expect(res).toBeNull();
        });
    });

    describe('buildMosquePhotoStreamUrl', () => {
        it('points at BFF mosque photo stream without embedding API keys', () => {
            const url = buildMosquePhotoStreamUrl(sampleMosque);
            expect(url).toContain('/api/mosque/photo');
            expect(url).toContain('mode=image');
            expect(url).toContain('name=');
            expect(url).not.toContain('key=');
            expect(url).not.toContain('googleapis.com');
        });
    });

    describe('getMosqueImage multi-tiered resolution', () => {
        it('mosque.image varsa "Custom" kaynağıyla döner', async () => {
            const mosqueWithImg: Mosque = {
                ...sampleMosque,
                image: 'https://example.com/custom.jpg',
            };

            const result = await getMosqueImage(mosqueWithImg, 'TEST_KEY');
            expect(result.source).toBe('Custom');
            expect(result.url).toBe('https://example.com/custom.jpg');
        });

        it('rejects custom Google key-bearing URLs and falls through', async () => {
            const mosqueWithKey: Mosque = {
                ...sampleMosque,
                image: 'https://maps.googleapis.com/maps/api/streetview?key=SECRET',
            };

            vi.stubGlobal(
                'Image',
                class {
                    onload: (() => void) | null = null;
                    onerror: (() => void) | null = null;
                    set src(_v: string) {
                        queueMicrotask(() => this.onerror?.());
                    }
                }
            );

            vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    query: {
                        pages: {
                            '1': { thumbnail: { source: 'https://wiki.org/cinili.jpg' } },
                        },
                    },
                }),
            } as Response);

            const result = await getMosqueImage(mosqueWithKey, 'TEST_KEY');
            expect(result.url).not.toContain('key=SECRET');
            expect(result.url).not.toContain('googleapis.com');
            expect(result.source).toBe('Wikipedia');
        });

        it('Wikipedia görseli bulunduğunda "Wikipedia" kaynağı döner', async () => {
            // Fail BFF stream via Image mock
            vi.stubGlobal(
                'Image',
                class {
                    onload: (() => void) | null = null;
                    onerror: (() => void) | null = null;
                    set src(_v: string) {
                        queueMicrotask(() => this.onerror?.());
                    }
                }
            );

            vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    query: {
                        pages: {
                            '1': { thumbnail: { source: 'https://wiki.org/cinili.jpg' } },
                        },
                    },
                }),
            } as Response);

            const result = await getMosqueImage(sampleMosque, 'TEST_KEY');
            expect(result.source).toBe('Wikipedia');
            expect(result.url).toBe('https://wiki.org/cinili.jpg');
        });
    });
});
