import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    fetchWikipediaMosqueImage,
    fetchDirectedStreetView,
    getMosqueImage,
    clearMosqueImageCache,
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

    describe('fetchDirectedStreetView', () => {
        it('Metadata OK olduğunda hesaplanmış heading içeren Street View URL üretir', async () => {
            const mockMetadata = {
                status: 'OK',
                location: {
                    lat: 41.0225,
                    lng: 29.0200,
                },
            };

            vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
                ok: true,
                json: async () => mockMetadata,
            } as Response);

            const res = await fetchDirectedStreetView(41.0227, 29.0203, 'TEST_API_KEY');
            expect(res).not.toBeNull();
            expect(res?.url).toContain('https://maps.googleapis.com/maps/api/streetview');
            expect(res?.url).toContain('heading=');
            expect(res?.url).toContain('pitch=12');
            expect(res?.heading).toBeGreaterThanOrEqual(0);
        });

        it('Metadata hatasında null döner', async () => {
            vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'ZERO_RESULTS' }),
            } as Response);

            const res = await fetchDirectedStreetView(41.0227, 29.0203, 'TEST_API_KEY');
            expect(res).toBeNull();
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

        it('Wikipedia görseli bulunduğunda "Wikipedia" kaynağı döner', async () => {
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
