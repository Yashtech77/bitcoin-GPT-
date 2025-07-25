import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/chat": {
        target: "https://bitcoin.jetkingbtc.tech/api/",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
