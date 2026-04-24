import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import PackageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  server: {
    host: "::",
    port: 3001,
  },
  plugins: [
    react()
  ],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(PackageJson.version),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
