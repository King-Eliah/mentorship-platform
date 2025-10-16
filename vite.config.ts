import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use base path for GitHub Pages, but not in development
  base: process.env.NODE_ENV === 'production' ? '/mentorship-platform/' : '/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    global: 'globalThis',
  },
});
