/// <reference types="vitest" />
import { pioneer } from "@open-pioneer/vite-plugin-pioneer";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig, PluginOption } from "vite";
import eslint from "vite-plugin-eslint";
import { visualizer } from "rollup-plugin-visualizer";

// Minimum browser versions supported by generated JS/CSS
// See also:
// - https://vitejs.dev/config/build-options.html#build-target
// - https://esbuild.github.io/api/#target
const targets = ["chrome92", "edge92", "firefox91", "safari14"];

// Generates a stats.html in the output dir to inspect bundle sizes.
// See also: https://github.com/btd/rollup-plugin-visualizer
const visualize = false;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const devMode = mode === "development";

    // Allowed values are "DEBUG", "INFO", "WARN", "ERROR"
    const logLevel = devMode ? "INFO": "WARN";

    return {
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
                sites: [
                    "api-sample",
                    "chakra-sample",
                    "extension-sample",
                    "map-sample",
                    "properties-sample",
                    "styling-sample",
                    "i18n-sample"
                ]
            }),
            react(),
            eslint(),
            visualize &&
                (visualizer({ gzipSize: true, brotliSize: true, emitFile: true }) as PluginOption)
        ],

        // define global constants
        // See also: https://vitejs.dev/config/shared-options.html#define
        define: {
            __LOG_LEVEL__: JSON.stringify(logLevel)
        },

        // https://vitest.dev/config/
        test: {
            globals: true
        }

        // disable hot reloading
        // in dev mode press "r" to trigger reload and make changes active
        // See also: https://vitejs.dev/config/server-options.html#server-hmr
        /*server: {
            hmr: false
        }*/
    };
});
