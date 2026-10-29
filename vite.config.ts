// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { availableParallelism } from "node:os";
import { resolve } from "node:path";
import { env } from "node:process";
import { pioneer } from "@open-pioneer/vite-plugin-pioneer";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, UserConfig } from "vite";
import { dependencySourcemaps } from "./support/vite/dependency-sourcemaps.ts";

const sampleSites = ["samples/map-sample", "samples/i18n-howto"];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const devMode = mode === "development";

    // Allowed values are "DEBUG", "INFO", "WARN", "ERROR"
    const logLevel = devMode ? "INFO" : "WARN";

    return {
        root: resolve(import.meta.dirname, "src"),

        // Load .env files from this directory instead of `root`.
        envDir: import.meta.dirname,

        // Generates relative urls in html etc.
        base: "./",

        // Vite's build output is written to dist/www
        build: {
            outDir: resolve(import.meta.dirname, "dist/www"),
            emptyOutDir: true,

            // Minimum browser versions supported by generated JS/CSS
            // See also:
            // - https://vitejs.dev/config/build-options.html#build-target
            target: "baseline-widely-available"
        },

        optimizeDeps: {
            // Include services.{js/ts} files as entry points.
            // This makes it easier for vite's dev server to find dependencies,
            // and thereby reduces the number of repeated bundler executions on dev server startup.
            // Adapt the file patterns if your service modules used a different naming scheme.
            entries: ["**/*.html", "**/services.{ts,js}", "!**/dist/**"],

            // Preserve dependency source maps through pre-bundling (see plugin for details).
            // You can disable this if you don't need to see the source code of dependencies when debugging.
            rolldownOptions: {
                plugins: [dependencySourcemaps()]
            }
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
            react()
        ],

        // Ignore irrelevant deprecations.
        css: {
            preprocessorOptions: {
                scss: {
                    silenceDeprecations: ["import"]
                }
            }
        },

        // define global constants
        // See also: https://vitejs.dev/config/shared-options.html#define
        define: {
            __LOG_LEVEL__: JSON.stringify(logLevel)
        },

        // https://vitest.dev/config/
        test: {
            silent: "passed-only",
            projects: [
                {
                    test: {
                        name: "unit",
                        globals: true,
                        include: ["**/*.{test,spec}.*"],
                        exclude: [
                            "**/node_modules/**",
                            "**/*.browser.{test,spec}.*",
                            "**/*.{test,spec}.*.snap"
                        ],
                        environment: "happy-dom", // can be changed to "node" if happy-dom is no longer needed
                        setupFiles: ["testing/global-setup.ts"], // can be cleaned up if happy-dom is no longer needed
                        server: {
                            deps: {
                                // Workaround to fix some import issues, see
                                // https://github.com/open-pioneer/trails-openlayers-base-packages/issues/314
                                inline: [/@open-pioneer[/\\]/, /ol\//]
                            }
                        }
                    }
                },
                {
                    test: {
                        name: "browser",
                        include: ["**/*.browser.{test,spec}.*"],
                        exclude: ["**/node_modules/**", "**/*.{test,spec}.*.snap"],
                        server: {
                            deps: {
                                // Workaround to fix some import issues, see
                                // https://github.com/open-pioneer/trails-openlayers-base-packages/issues/314
                                inline: [/@open-pioneer[/\\]/]
                            }
                        },
                        testTimeout: 5000,

                        // Browser tests get their own group because Vitest rejects projects with
                        // different `maxWorkers` in one group; unit and arch tests keep the default.
                        maxWorkers: browserTestWorkers(),
                        sequence: { groupOrder: 1 },
                        browser: {
                            enabled: true,
                            provider: playwright(),

                            // Disable creation of screenshots for failing tests
                            screenshotFailures: false,

                            // https://vitest.dev/config/browser/playwright
                            instances: [{ browser: "chromium" }],
                            viewport: {
                                height: 600,
                                width: 800
                            }
                        }
                    }
                }
            ]
        },

        // prettier-ignore
        server: {
            // Use this option if your development setup uses hostnames other than localhost.
            // See also https://vite.dev/config/server-options.html#server-allowedhosts
            // allowedHosts: [".example.com"],
                        
            // disable hot reloading
            // in dev mode press "r" to trigger reload and make changes active
            // See also: https://vitejs.dev/config/server-options.html#server-hmr
            // hmr: false
        }
    } satisfies UserConfig;
});

// Reduce parallelism -- too much parallel jobs cause rendering timeouts in headless mode.
function browserTestWorkers(): number {
    const minimum = env.CI ? 2 : 1;
    return Math.max(minimum, Math.floor(availableParallelism() / 4));
}
