import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Local Knowledge Search',
        short_name: 'Knowledge Search',
        description: 'Privacy-first semantic search across personal documents',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 50_000_000, // 50MB for ONNX models
      }
    })
  ],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-setup.ts']
  },
  optimizeDeps: {
    include: ['@xenova/transformers'],
    exclude: ['@lancedb/lancedb']
  },
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      external: ['@lancedb/lancedb']
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})
