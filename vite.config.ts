/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
    root: resolve(__dirname, "src"),
    build: {
        outDir: resolve(__dirname, "dist"),
        emptyOutDir: true,
    },
    plugins: [react(), eslint()],

    // https://vitest.dev/config/
    test: {}
});
