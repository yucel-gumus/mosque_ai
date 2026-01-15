import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
          'virtualization': ['react-virtuoso'],
        },
      },
    },
  },
})

