/// <reference types="vitest" />
import { pioneer } from "@open-pioneer/vite-plugin-pioneer";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
    root: resolve(__dirname, "src"),

    // Generates relative urls in html etc.
    base: "./",

    build: {
        outDir: resolve(__dirname, "dist"),
        emptyOutDir: true,
    },

    plugins: [
        pioneer({
            rootSite: true,
            apps: ["date-app"],
            sites: [
                "date-sample", 
                "logging-sample", 
                "services-sample", 
                "map-sample"
            ]
        }),
        react(),
        eslint()
    ],

    // https://vitest.dev/config/
    test: {}
});
