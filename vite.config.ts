import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
            manifest: {
                name: 'İstanbul Camileri Haritası',
                short_name: 'Camiler',
                description:
                    "İstanbul'daki 3000'den fazla camiyi harita üzerinde keşfedin, en yakınınızı bulun.",
                theme_color: '#0ea5e9',
                background_color: '#0b1220',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/mosque_ai/',
                start_url: '/mosque_ai/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,json,png,svg,ico,woff2}'],
                navigateFallback: '/mosque_ai/index.html',
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/[abc]\.basemaps\.cartocdn\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'osm-tiles',
                            expiration: {
                                maxEntries: 500,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 gün
                            },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/server\.arcgisonline\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'esri-tiles',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24 * 30,
                            },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'prayer-times',
                            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 6 },
                        },
                    },
                ],
            },
        }),
    ],
    base: '/mosque_ai/',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-core': ['react', 'react-dom'],
                    'leaflet-core': ['leaflet'],
                    'leaflet-react': ['react-leaflet', 'react-leaflet-cluster'],
                    'radix-ui': [
                        '@radix-ui/react-select',
                        '@radix-ui/react-separator',
                        '@radix-ui/react-slider',
                        '@radix-ui/react-slot',
                    ],
                    'ui-utils': ['lucide-react', 'clsx', 'tailwind-merge', 'class-variance-authority'],
                    'state-search': ['zustand', 'minisearch'],
                    'virtualization': ['react-virtuoso'],
                },
            },
        },
    },
});
