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
        type: 'custom',
        filePathResolver: (importPath, sourceFilePath) => {
          if (importPath === '@moul-dev/ui/tokens.stylex' || importPath === '@moul-dev/ui/tokens') {
            return path.resolve(__dirname, 'node_modules/@moul-dev/ui/dist/tokens.stylex.js');
          }
          if (importPath.startsWith('.')) {
            return path.resolve(path.dirname(sourceFilePath), importPath);
          }
          return undefined;
        },
        getCanonicalFilePath: (filePath) => {
          if (filePath.includes('@moul-dev/ui') && filePath.includes('tokens.stylex')) {
            return '@moul-dev/ui:src/tokens/tokens.stylex.ts';
          }
          return path.relative(__dirname, filePath);
        },
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
