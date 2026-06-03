import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/link': path.resolve(__dirname, './src/compat/next-link.tsx'),
      'next/navigation': path.resolve(__dirname, './src/compat/next-navigation.ts'),
    },
  },
  server: {
    port: 5173,
  },
})
