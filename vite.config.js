import { defineConfig } from 'vite';
import seo from './scripts/seo.mjs';

export default defineConfig({
  root: 'website',
  base: '/',
  publicDir: false,
  plugins: [seo()],
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'website/index.html'
    }
  }
});
