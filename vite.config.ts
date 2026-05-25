import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

function normalizeProxyTarget(value?: string) {
  const fallback = "https://damara.bluerack.org";
  const raw = (value || fallback).replace(/\/$/, "");
  return raw.endsWith("/api") ? raw.slice(0, -4) : raw;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = normalizeProxyTarget(env.VITE_API_BASE || env.VITE_API_BASE_URL || env.VITE_API_URL);

  return {
    plugins: [react()],
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@features": path.resolve(__dirname, "./src/features"),
        "@shared": path.resolve(__dirname, "./src/shared"),
        "@app": path.resolve(__dirname, "./src/app"),
      },
    },
    build: {
      target: "esnext",
      outDir: "dist",
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
