import react from "@vitejs/plugin-react";

/// <reference types="vitest/config" />
/// <reference types="vitest/client" />

import { defineConfig } from "vitest/config";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  test: {
    globals: true,
    environment: "jsdom",
    css: true,
  },
});
