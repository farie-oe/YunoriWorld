import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Updates the service worker (and the app shell it serves) in the
      // background on each visit, without a custom "update available"
      // prompt UI — the existing app is otherwise untouched.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png'],
      manifest: {
        name: 'Yunori World',
        short_name: 'Yunori',
        description: 'A personal anime collection and watch-list organiser.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        // Reused from the existing "Soft White" theme (src/styles/themes.css
        // [data-theme='sakura-pink']) — the app's current default theme —
        // rather than inventing new brand colours.
        background_color: '#faf9f7',
        theme_color: '#f9f4ef',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache only the app shell (JS/CSS/HTML/fonts/icons) — explicitly
        // NOT the two multi-megabyte login/register background photos in
        // public/images (they also exceed Workbox's default 2MB-per-file
        // precache limit). No runtimeCaching rules are defined at all, so
        // every request to Supabase (auth, REST, Storage, Edge Functions)
        // and AniList is left completely untouched by the service worker
        // and always goes straight to the network, exactly as it does today.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        globIgnores: ['images/**'],
      },
    }),
  ],
})
