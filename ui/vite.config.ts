import { defineConfig } from 'vite';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/_moul_/',
  build: {
    outDir: '../pkg/ui/dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        ws: true,
      },
      '/storage': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
      // The API reference embedded by the docs page, and the spec it loads
      '/docs': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
      '^/openapi\\.(yml|json)$': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
