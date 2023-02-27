// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0

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

const sampleSites = [
    "samples/api-sample",
    "samples/chakra-sample",
    "samples/extension-sample",
    "samples/map-sample",
    "samples/properties-sample",
    "samples/styling-sample",
    "samples/i18n-sample"
];

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
                // Whether to include src/index.html in the built output
                rootSite: true,

                // Additional directories to include as html (must contain index.html files)
                sites: [
                    "sites/empty",

                    // Include sample sites in the build
                    ...sampleSites
                ],

                // Apps to distribute as .js files for embedded use cases
                apps: []
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
