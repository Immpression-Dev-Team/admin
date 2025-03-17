import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@styles': '/src/styles',
      '@assets': '/src/assets',
    },
  },
  server: {
    host: '0.0.0.0',
    strictPort: true,
    port: 5137,
  }
})