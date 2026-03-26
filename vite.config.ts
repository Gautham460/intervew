/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/intervew/",
  plugins: [react() as any],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./setupTests.ts'],
    globals: true,
  },
});
