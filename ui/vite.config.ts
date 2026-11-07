import { defineConfig } from 'vite';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/_moul_/',
  build: {
    outDir: '../pkg/ui/dist',
    emptyOutDir: true,
    // @moul-dev/web-component themes with light-dark(), which the theme switch drives through `color-scheme`
    // on <html>. For older targets Lightning CSS rewrites light-dark() into variables that follow
    // the OS setting instead, so the built console would ignore the Light/Dark choice.
    cssTarget: ['chrome123', 'edge123', 'firefox120', 'safari17.5', 'ios17.5'],
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
