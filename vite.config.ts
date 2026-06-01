import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/litellm': {
        target: process.env.VITE_LITELLM_BASE_URL ?? 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/litellm/, ''),
      },
    },
  },
});
