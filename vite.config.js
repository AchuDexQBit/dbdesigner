import { URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const api = (env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");

  let proxy;
  if (api.startsWith("http")) {
    try {
      const u = new URL(api);
      const prefix = u.pathname.replace(/\/+$/, "") || "";
      if (prefix && prefix !== "/") {
        proxy = {
          [prefix]: {
            target: `${u.protocol}//${u.host}`,
            changeOrigin: true,
            secure: false,
          },
        };
      }
    } catch {
      /* ignore invalid VITE_API_BASE_URL */
    }
  }

  return {
    plugins: [react()],
    server: {
      port: 8001,
      ...(proxy ? { proxy } : {}),
    },
    preview: {
      port: 8001,
      ...(proxy ? { proxy } : {}),
    },
  };
});
