import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/chat": {
        target: "https://bitcoingpt-backkend.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
