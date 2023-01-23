import { Plugin, ResolvedConfig } from "vite";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { posix } from "node:path";
import { cwd } from "node:process";
import { type PioneerPluginOptions } from ".";

export function mpaPlugin(options: PioneerPluginOptions | undefined): Plugin {
    const rootSite = options?.rootSite ?? false;
    const apps = options?.apps || [];
    const sites = options?.sites || [];

    let resolvedConfig: ResolvedConfig;
    return {
        name: "pioneer:mpa",

        config(config) {
            const sourceRoot = config.root ?? cwd();
            const entryPoints = analyzeEntryPoints({ apps, sites, rootSite, sourceRoot });

            return {
                build: {
                    rollupOptions: {
                        input: entryPoints,
                        output: {
                            entryFileNames(chunk) {
                                if (apps.includes(chunk.name)) {
                                    return "[name].js";
                                }

                                // Vite default, see https://github.com/vitejs/vite/blob/2401253b9aa487c50edb5ec571d5ba7adc949e27/packages/vite/src/node/build.ts#L552
                                // This will rename the .js files that belong to a .html site.
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
                `Failed to find site '${siteName}' at ${path}. Please ensure that the site name is spelled correctly.`
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
        `Failed to find a matching entry point file for '${prefix}'. Supported extensions are ${extensions}. Ensure that the app name is spelled correctly or create the missing file.`
    );
}
