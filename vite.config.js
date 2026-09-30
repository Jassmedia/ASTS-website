import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import wpProxyPlugin from './server/vite-wp-proxy.js';

export default defineConfig(({ mode }) => {
  // WordPress backend settings (WP_ORIGIN, PUBLIC_ORIGIN, WP_PROXY_SECRET) for the local proxy.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ['WP_', 'PUBLIC_ORIGIN']));
  return {
    plugins: [react(), wpProxyPlugin()],
    build: {
      assetsInlineLimit: 0,
      cssCodeSplit: true,
      // The ported WordPress/theme stylesheets contain old IE hacks that the CSS
      // minifier reports as syntax errors; keep them byte-for-byte instead
      // (the live site serves them unminified too).
      cssMinify: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    ssr: {
      noExternal: ['react-helmet-async'],
    },
  };
});
