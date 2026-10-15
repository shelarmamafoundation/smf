// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/smf/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'शेलारमामा फाऊंडेशन',
        short_name: 'SMF',
        description: 'शेलारमामा फाऊंडेशन व्यवस्थापन आणि जनसंपर्क पोर्टल',
        theme_color: '#580A1A',
        background_color: '#580A1A',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/smf/',
        start_url: '/smf/',
        icons: [
          {
            src: '/smf/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/smf/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/smf/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})