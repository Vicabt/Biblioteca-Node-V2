import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Puerto para el cliente Vite
    proxy: {
      '/api': { // Si tus rutas de API comienzan con /api
        target: 'http://localhost:3000', // Tu backend
        changeOrigin: true,
      }
    }
  },
  css: {
    postcss: './postcss.config.js'
  }
});
