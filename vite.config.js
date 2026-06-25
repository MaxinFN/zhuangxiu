import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url)),
    },
  },
  assetsInclude: ['**/*.md'],

  server: {
    open: true,
  },

  build: {
    target: 'es2020',
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'chart-js': ['chart.js'],
          marked: ['marked'],
          highlight: ['highlight.js'],
          xlsx: ['xlsx'],
        },
      },
    },
  },
})
