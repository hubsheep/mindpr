import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { inspectAttr } from "plugin-inspect-react-code";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    inspectAttr(),
    react(),
    // PWA：manifest + standalone（design.md §6）
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "app-icon.png",
        "icon-192.png",
        "icon-512.png",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "心智日课",
        short_name: "心智日课",
        description: "每天训练大脑、心智与灵魂的自用日课",
        lang: "zh-CN",
        display: "standalone",
        orientation: "portrait",
        background_color: "#F6F2EC",
        theme_color: "#F6F2EC",
        start_url: "./",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // 预缓存全部静态资产，离线可用
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
