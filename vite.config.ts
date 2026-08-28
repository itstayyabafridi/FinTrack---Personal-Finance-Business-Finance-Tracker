import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "vercel-dist-compatibility",
      closeBundle() {
        try {
          const publicDir = path.resolve(import.meta.dirname, "dist", "public");
          const distDir = path.resolve(import.meta.dirname, "dist");
          if (fs.existsSync(publicDir)) {
            const indexSrc = path.join(publicDir, "index.html");
            const indexDest = path.join(distDir, "index.html");
            if (fs.existsSync(indexSrc)) {
              fs.copyFileSync(indexSrc, indexDest);
            }
            const assetsSrc = path.join(publicDir, "assets");
            const assetsDest = path.join(distDir, "assets");
            if (fs.existsSync(assetsSrc)) {
              fs.cpSync(assetsSrc, assetsDest, { recursive: true, force: true });
            }
          }
        } catch (err) {
          console.warn("Could not copy build files to dist root:", err);
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: false,
    },
  },
});
