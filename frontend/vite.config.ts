import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load .env file based on current mode (e.g., development)
  const env = loadEnv(mode, process.cwd(), "");
  console.log("Proxying to:", env.VITE_BACKEND_URL);
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },

      },
    },
  };
});
