import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { PluginContext } from "rollup";
import { normalizePath, Plugin, ResolvedConfig } from "vite";
import { createDebugger } from "./utils/debug";
import { generatePackagesMetadata } from "./codegen/metadataGeneration";
import { AppInfo, parseAppInfo } from "./parser/parseAppInfo";

const isDebug = !!process.env.DEBUG;
const debug = createDebugger("open-pioneer:codegen");

const PIONEER_PACKAGES_RE = /[?&]pioneer-packages($|&)/;
const SOURCE_FILE_RE = /^(.*?)(\?|$)/;

export function codegenPlugin(): Plugin {
    // key: normalized path to package json.
    // value: set of module ids that must be invalidated.
    const packageJsonDeps = new Map<string, Set<string>>();

    let config!: ResolvedConfig;
    return {
        name: "pioneer:codegen",

        buildStart() {
            packageJsonDeps.clear();
        },

        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },

        configureServer(server) {
            const config = server.config;
            const logger = server.config.logger;
            const watcher = server.watcher;

            // Trigger manual module reload when a watched file changes.
            watcher.add(`${config.root}/**/package.json`);
            watcher.on("all", async (_, path) => {
                const moduleIds = packageJsonDeps.get(normalizePath(path));
                if (!moduleIds) {
                    return;
                }

                logger.info(`${path} changed, reloading`, { clear: false, timestamp: true });

                for (const moduleId of moduleIds) {
                    const mod = server.moduleGraph.getModuleById(moduleId);
                    if (mod) {
                        await server.reloadModule(mod);
                    }
                }
            });
        },

        handleHotUpdate(ctx) {
            isDebug && debug("hot update: %O", ctx.file);
        },

        watchChange(id) {
            isDebug && debug("watch change: %O", id);
        },

        async resolveId(moduleId, importer) {
            if (moduleId === "open-pioneer:app") {
                if (!importer) {
                    this.error("Must be imported from a source file.");
                }

                return importer + "?pioneer-packages";
            }
        },

        async load(this: PluginContext, moduleId) {
            if (moduleId.match(PIONEER_PACKAGES_RE)) {
                const importer = getSourceFile(moduleId);
                const pkgJsonPath = findPackageJson(dirname(importer), config.root);
                if (!pkgJsonPath) {
                    this.error(`Failed to find package.json for app from '${importer}'.`);
                }

                isDebug && debug(`Generating metadata for app at ${pkgJsonPath}`);
                const appInfo = await parseAppInfo(this, dirname(pkgJsonPath));
                watchFiles(appInfo, packageJsonDeps, moduleId);

                const generatedSourceCode = generatePackagesMetadata(appInfo.packages);
                isDebug && debug("Generated source content: %O", generatedSourceCode);
                return generatedSourceCode;
            }
        }
    };
}

function watchFiles(appInfo: AppInfo, packageJsonDeps: Map<string, Set<string>>, moduleId: string) {
    const visitPath = (path: string) => {
        const normalizedPath = normalizePath(path);
        let moduleIds = packageJsonDeps.get(normalizedPath);
        if (!moduleIds) {
            moduleIds = new Set();
            packageJsonDeps.set(normalizedPath, moduleIds);
        }
        moduleIds.add(moduleId);
    };

    for (const pkg of appInfo.packages) {
        visitPath(pkg.packageJsonPath);
    }
    visitPath(appInfo.packageJsonPath);
}

function findPackageJson(startDir: string, rootDir: string) {
    let dir = startDir;
    while (dir) {
        const candidate = join(dir, "package.json");
        debug("checking", candidate);
        if (existsSync(candidate)) {
            return candidate;
        }

        if (normalizePath(dir) == normalizePath(rootDir)) {
            return undefined;
        }

        const parent = dirname(dir);
        dir = parent === dir || parent === "." ? "" : parent;
    }
    return undefined;
}

function getSourceFile(moduleId: string) {
    const sourceFile = moduleId.match(SOURCE_FILE_RE)?.[1];
    if (!sourceFile || moduleId[0] == "\0") {
        throw new Error(`Failed to get actual source file from '${moduleId}'.`);
    }
    return sourceFile;
}
