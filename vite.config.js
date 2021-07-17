import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path";
// https://vitejs.dev/config/


export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [vue()
    // , eslintPlugin({ fix: true })
  ],
  server: {
    port: 8080,
    proxy: {
      "^/api": {
        target: "http://localhost:7071",
        changeOrigin: true,
      },
    },
  }
})
