import { cwd } from "node:process";
import { resolve } from "node:path";
import * as posix from "node:path/posix";
import { Plugin, ResolvedConfig } from "vite";
import { existsSync } from "node:fs";

/** Options for the open-pioneer vite plugin. */
export interface PioneerPluginOptions {
    /**
     * Whether to include the root `index.html` site (by default at `src/index.html`) in the build.
     *
     * The file is always available when using the development server, but may be excluded when
     * when deploying the project as it often contains content for testing.
     *
     * @default false
     */
    rootSite?: boolean;

    /**
     * List of sites to include in the build.
     *
     * Sites are located at `src/sites/<SITE_NAME>/index.html` by default.
     *
     * @default []
     */
    sites?: string[];

    /**
     * List of apps to include in the build.
     * Apps typically register a custom web component.
     *
     * Apps are located at `src/apps/<APP_NAME>/app.<EXT>` by default.
     * When an app is included in the build, the `dist` directory will
     * contain a `app.js` that can be directly imported from the browser.
     *
     * Multiple extensions are supported for the app's main entry point: .ts, .tsx, .js and .jsx.
     *
     * @default []
     */
    apps?: string[];
}

export function pioneer(options?: PioneerPluginOptions): Plugin {
    const { apps = [], sites = [], rootSite = false } = options ?? {};

    let resolvedConfig: ResolvedConfig;

    return {
        name: "pioneer",

        config(config) {
            const sourceRoot = config.root ?? cwd();
            const entryPoints = analyzeEntryPoints({ apps, sites, rootSite, sourceRoot });

            return {
                build: {
                    rollupOptions: {
                        input: entryPoints,
                        output: {
                            entryFileNames(chunk) {
                                if (entryPoints[chunk.name]) {
                                    return "[name].js";
                                }
                                // Vite default, see https://github.com/vitejs/vite/blob/2401253b9aa487c50edb5ec571d5ba7adc949e27/packages/vite/src/node/build.ts#L552
                                return posix.join(
                                    resolvedConfig.build.assetsDir,
                                    "[name].[hash].js"
                                );
                            }
                        }
                    }
                }
            };
        },

        configResolved(config) {
            resolvedConfig = config;
        }
    };
}

function analyzeEntryPoints(options: {
    apps: string[];
    sites: string[];
    rootSite: boolean;
    sourceRoot: string;
}): Record<string, string> {
    const apps = options.apps.map((appName) => {
        const prefix = resolve(options.sourceRoot, "apps", appName, "app");
        const path = findMatchingEntryPointFile(prefix);
        return {
            name: appName,
            path: path
        };
    });
    const sites = options.sites.map((siteName) => {
        const path = resolve(options.sourceRoot, "sites", siteName, "index.html");
        if (!existsSync(path)) {
            throw new Error(
                `Failed to find site '${siteName}' at ${path}. Please create the missing file.`
            );
        }
        return {
            name: siteName,
            path: path
        };
    });
    if (options.rootSite) {
        const path = resolve(options.sourceRoot, "index.html");
        if (!existsSync(path)) {
            throw new Error(`Failed to find root site at ${path}. Please create the missing file.`);
        }
        sites.push({
            name: "index",
            path: path
        });
    }

    const entryPoints: Record<string, string> = {};
    let entryPointCount = 0;
    for (const { name, path } of [apps, sites].flat()) {
        const existingPath = entryPoints[name];
        if (existingPath) {
            throw new Error(
                `Entry point '${name}' was defined twice (paths ${existingPath} and ${path}). Please remove the duplicated entry.`
            );
        }
        entryPoints[name] = path;
        ++entryPointCount;
    }
    if (entryPointCount === 0) {
        throw new Error(
            "You must configure at least one site or one app in the pioneer plugin options."
        );
    }
    return entryPoints;
}

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

function findMatchingEntryPointFile(prefix: string) {
    for (const ext of EXTENSIONS) {
        const candidate = prefix + ext;
        if (existsSync(candidate)) {
            return candidate;
        }
    }

    const extensions = EXTENSIONS.join(", ");
    throw new Error(
        `Failed to find a matching entry point file for '${prefix}'. Supported extensions are ${extensions}. Please create the missing file.`
    );
}
