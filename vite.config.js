import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths({})],
  resolve: {
    alias: {
      '~scss/settings': path.resolve(__dirname, 'src/scss/_settings.scss'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
