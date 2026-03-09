import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devApiTarget = env.VITE_DEV_API_TARGET || 'http://localhost:9000'
  const devWsTarget = env.VITE_DEV_WS_TARGET || 'ws://localhost:9000'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': devApiTarget,
        '/ws': {
          target: devWsTarget,
          ws: true
        }
      }
    }
  }
})
