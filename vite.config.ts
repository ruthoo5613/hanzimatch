import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    root: '.',
    base: '/',
    build: {
      outDir: 'dist',
      assetsInlineLimit: 0,
    },
    define: {
      'import.meta.env.VITE_PAYPAL_CLIENT_ID': JSON.stringify(env.PAYPAL_CLIENT_ID || ''),
    },
  }
})
