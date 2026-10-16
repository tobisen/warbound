import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// The game stays at /warbound/; this deck is published alongside it.
export default defineConfig(({ command, isPreview }) => ({
  base: process.env.VITE_BASE_PATH || (command === 'build' || isPreview ? '/warbound/presentation/' : '/'),
  plugins: [vue()],
}))
