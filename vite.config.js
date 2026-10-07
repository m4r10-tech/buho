import { defineConfig } from "vite";

export default defineConfig({
  // Rutas relativas: el build funciona en un dominio propio o en GitHub Pages (/buho/)
  base: "./",
  build: {
    target: "es2020",
    assetsInlineLimit: 0,
    sourcemap: false
  },
  server: { port: 5173 },
  preview: { port: 4173 },
  test: {
    environment: "node",
    include: ["src/**/*.test.js"]
  }
});
