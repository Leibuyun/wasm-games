import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { viteSingleFile } from 'vite-plugin-singlefile'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      '@': path.join(__dirname, './src'),
    },
  },
})
