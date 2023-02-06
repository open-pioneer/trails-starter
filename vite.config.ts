/// <reference types="vitest" />
import { pioneer } from "@open-pioneer/vite-plugin-pioneer";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";

// Minimum browser versions supported by generated JS/CSS
// See also:
// - https://vitejs.dev/config/build-options.html#build-target
// - https://esbuild.github.io/api/#target
const targets = [
    "chrome92",
    "edge92",
    "firefox91",
    "safari14"
];

// https://vitejs.dev/config/
export default defineConfig({
    root: resolve(__dirname, "src"),

    // Generates relative urls in html etc.
    base: "./",

    build: {
        outDir: resolve(__dirname, "dist"),
        emptyOutDir: true,
        target: targets
    },

    plugins: [
        pioneer({
            rootSite: true,
            apps: ["date-app"],
            sites: [
                "date-sample", 
                "logging-sample", 
                "services-sample", 
                "map-sample",
                "styling-sample",
                "chakra-sample"
            ]
        }),
        react(),
        eslint()
    ],

    // https://vitest.dev/config/
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./tests/setup.js",
    }
});
