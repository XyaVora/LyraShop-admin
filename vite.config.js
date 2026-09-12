import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxy = {
  "/api": {
    target: "http://localhost:8080",
    changeOrigin: true,
    configure(proxy) {
      // The browser talks to Vite on the same origin; upstream CORS is unnecessary.
      proxy.on("proxyReq", (proxyReq) => proxyReq.removeHeader("origin"));
    }
  }
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    proxy: apiProxy
  },
  preview: {
    port: 4174,
    strictPort: true,
    proxy: apiProxy
  },
  test: {
    environment: "jsdom",
    globals: true
  }
});
