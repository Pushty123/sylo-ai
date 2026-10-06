import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Phones on the same Wi-Fi open http://<laptop-ip>:5173 and Vite forwards AI calls
  // to the FastAPI backend running on this laptop, so phones never need the backend address.
  const backend = env.VITE_PROXY_TARGET || 'http://127.0.0.1:8000'
  const proxy = {
    '/api': { target: backend, changeOrigin: true },
    '/private-ai': { target: backend, changeOrigin: true },
    '/health': { target: backend, changeOrigin: true },
  }
  return {
    plugins: [react(), tailwindcss()],
    server: { host: true, port: 5173, proxy },
    preview: { host: true, port: 4173, proxy },
  }
})
