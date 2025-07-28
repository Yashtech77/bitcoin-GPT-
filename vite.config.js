import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/chat": {
        target: "VITE_API_BASE_URL=http://13.235.70.241/api",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
