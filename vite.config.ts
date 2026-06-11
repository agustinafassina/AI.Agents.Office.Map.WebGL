import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

function resolveLitellmProxyTarget(env: Record<string, string>): string {
  const explicit = env.LITELLM_PROXY_TARGET?.trim();
  if (explicit) return explicit;

  const base = env.VITE_LITELLM_BASE_URL?.trim();
  if (base && /^https?:\/\//i.test(base)) return base;

  return 'http://localhost:4000';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const litellmProxyTarget = resolveLitellmProxyTarget(env);

  return {
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/@react-three/postprocessing') ||
            id.includes('node_modules/postprocessing')
          ) {
            return 'postprocessing';
          }
          if (
            id.includes('node_modules/react-markdown') ||
            id.includes('node_modules/remark-gfm') ||
            id.includes('node_modules/remark-') ||
            id.includes('node_modules/micromark') ||
            id.includes('node_modules/mdast-') ||
            id.includes('node_modules/unist-')
          ) {
            return 'markdown';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/litellm': {
        target: litellmProxyTarget,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/litellm/, ''),
      },
    },
  },
};
});
