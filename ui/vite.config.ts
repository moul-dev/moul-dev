import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { devtools } from '@tanstack/devtools-vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import stylex from '@stylexjs/unplugin';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    devtools({
      removeDevtoolsOnBuild: true,
      injectSource: {
        enabled: true,
      },
      consolePiping: {
        enabled: true,
      },
    }),
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    stylex.vite({
      useCSSLayers: true,
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: __dirname,
      },
    }),
    react(),
  ],
  base: '/_moul_/',
  build: {
    outDir: '../internal/ui/dist',
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
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
