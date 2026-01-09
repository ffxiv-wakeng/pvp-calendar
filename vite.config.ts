import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import PackageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? `/${PackageJson.name}/` : './',
  server: {
    host: "::",
    port: 3001,
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
