import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const capasDir = path.join(__dirname, "public", "capas");

function capasNotFoundPlugin() {
  return {
    name: "capas-not-found",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] || "";

        if (!url.startsWith("/capas/") || url.endsWith("manifest.json")) {
          next();
          return;
        }

        const relativePath = decodeURIComponent(url.replace("/capas/", ""));
        const filePath = path.join(capasDir, relativePath);

        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
          res.statusCode = 404;
          res.end("Capa nao encontrada");
          return;
        }

        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] || "";

        if (!url.startsWith("/capas/") || url.endsWith("manifest.json")) {
          next();
          return;
        }

        const relativePath = decodeURIComponent(url.replace("/capas/", ""));
        const filePath = path.join(capasDir, relativePath);

        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
          res.statusCode = 404;
          res.end("Capa nao encontrada");
          return;
        }

        next();
      });
    },
  };
}

const apiProxy = {
  "/api": {
    target: "http://127.0.0.1:8080",
    changeOrigin: true,
    secure: false,
  },
};

export default defineConfig({
  plugins: [react(), capasNotFoundPlugin()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    proxy: apiProxy,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
    allowedHosts: true,
    proxy: apiProxy,
  },
});
