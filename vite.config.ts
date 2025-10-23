import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set the base path to be relative. This is crucial for deploying
  // the app to a subdirectory on a server. It ensures that all asset
  // paths in the built index.html are relative (e.g., "./assets/index.js")
  // instead of absolute (e.g., "/assets/index.js").
  base: './',
})
