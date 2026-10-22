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
        // Sem isso o Vite responde 500 quando a API está fora do ar, e o front
        // confunde com um erro da própria API. 502 = API inalcançável.
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if ('writeHead' in res && !res.headersSent) {
              res.writeHead(502)
              res.end()
            }
          })
        },
      },
    },
  },
})
