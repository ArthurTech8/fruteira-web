import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// A API do Projeto-Fruteira roda em http://localhost:5022 (dotnet run --launch-profile http).
// O proxy encaminha /api para ela, então o front não depende de CORS.
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5022',
        changeOrigin: true,
      },
    },
  },
})
