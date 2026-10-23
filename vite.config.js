import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Configure Vite and the browser-like environment used by tests.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/testSetup.js",
  },
});