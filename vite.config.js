import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('@google/generative-ai')) {
            return 'ai-vendor'
          }

          if (id.includes('@supabase/')) {
            return 'supabase-vendor'
          }

          if (
            id.includes('react-toastify') ||
            id.includes('lucide-react') ||
            id.includes('react-rnd') ||
            id.includes('web-haptics')
          ) {
            return 'ui-vendor'
          }

          if (
            id.includes('/react/') ||
            id.includes('\\react\\') ||
            id.includes('/react-dom/') ||
            id.includes('\\react-dom\\')
          ) {
            return 'react-vendor'
          }

          return 'vendor'
        }
      }
    }
  },
  base: '/',
  server: {
    port: 3000,
    host: true
  },
  test: {
    exclude: ['node_modules/**', 'tests/**', 'test-results/**']
  }
})
