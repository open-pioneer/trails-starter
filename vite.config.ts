import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
    root: resolve(__dirname, "src"),
    build: {
        outDir: resolve(__dirname, "dist"),
        emptyOutDir: true,
    },
    plugins: [react()],
});
