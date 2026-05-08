import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      "/colyseus": {
        target: "http://localhost:2567",
        ws: true,
      },
    },
  },
  build: {
    outDir: "../server/public",
    emptyOutDir: true,
  },
});
