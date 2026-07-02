import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves this project from https://<user>.github.io/Workout/,
// so assets and the PWA manifest need to be rooted at /Workout/ in production.
const base = process.env.GITHUB_PAGES ? '/Workout/' : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: '트렌드핏 TrendFit',
        short_name: 'TrendFit',
        description: '운동 추세를 읽고 다음 주를 처방하는 의지력 대행 앱',
        theme_color: '#bf5209',
        background_color: '#eeeeec',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
