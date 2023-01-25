import { build } from "vite";
import { pioneer, PioneerPluginOptions } from "../src/index";

export async function runViteBuild(options: {
    outDir: string;
    rootDir: string;
    pluginOptions: PioneerPluginOptions;
}) {
    await build({
        root: options.rootDir,

        build: {
            minify: false,
            outDir: options.outDir,
            emptyOutDir: true,
            rollupOptions: {
                // Don't log warnings during tests
                onwarn() {
                    void 0;
                }
            }
        },

        plugins: [pioneer(options.pluginOptions)],

        logLevel: "silent"
    });
}
