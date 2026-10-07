import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/_moul_/',
  build: {
    outDir: '../pkg/ui/dist-lit', // Don't overwrite the current one for now
    emptyOutDir: true,
  },
  server: {
    port: 5174, // Run on a different port than the React one
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
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
