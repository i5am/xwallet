import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer',
      events: 'events',
      util: 'util',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    target: 'es2015',
    minify: false,
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
        Buffer: 'Buffer',
      },
      inject: [path.resolve(__dirname, './src/buffer-polyfill.js')],
    },
    include: ['buffer', 'events', 'util', 'stream-browserify', 'crypto-browserify', 'bitcoinjs-lib', 'bip32', 'bip39', 'tiny-secp256k1', 'ecpair'],
    exclude: [],
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
});
