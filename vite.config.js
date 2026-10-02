import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  server: {
    allowedHosts: ['1926-2401-4900-1c55-588b-f3e2-b320-7489-5836.ngrok-free.app'],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        drawing: resolve(__dirname, 'apps/drawing/index.html'),
      },
    },
  },
})
