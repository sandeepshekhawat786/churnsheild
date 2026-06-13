import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // ── Path aliases ──
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ── Dev server ──
  server: {
    port: 5173,
    open: true,          // auto-open browser on `vite dev`
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  // ── Production build ──
  build: {
    outDir: "dist",
    sourcemap: false,    // flip to true if you need prod debugging
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor libs into a separate cached chunk
        manualChunks: {
          react:    ["react", "react-dom"],
          charts:   ["recharts"],
          icons:    ["lucide-react"],
          http:     ["axios"],
        },
      },
    },
  },

  // ── Preview server (vite preview) ──
  preview: {
    port: 4173,
    open: true,
  },
});