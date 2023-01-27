import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { PluginContext } from "rollup";
import { normalizePath, Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { createDebugger } from "./utils/debug";
import { generatePackagesMetadata } from "./codegen/generatePackagesMetadata";
import { MetadataContext, MetadataRepository } from "./metadata/MetadataRepository";
import { generateCombinedCss } from "./codegen/generateCombinedCss";
import { generateAppMetadata } from "./codegen/generateAppMetadata";
import { APP_META_QUERY, parseVirtualAppModuleId } from "./codegen/shared";

const isDebug = !!process.env.DEBUG;
const debug = createDebugger("open-pioneer:codegen");

export function codegenPlugin(): Plugin {
    // key: normalized path to package json.
    // value: set of module ids that must be invalidated.
    const manualDeps = new Map<string, Set<string>>();

    let config!: ResolvedConfig;
    let metadata!: MetadataRepository;
    let devServer: ViteDevServer | undefined;
    return {
        name: "pioneer:codegen",

        buildStart() {
            manualDeps.clear();
            metadata?.reset();
        },

        configResolved(resolvedConfig) {
            config = resolvedConfig;
            metadata = new MetadataRepository(config.root);
        },

        configureServer(server) {
            devServer = server;

            // Trigger manual module reload when a watched file changes.
            server.watcher.on("all", (_, path) => {
                const moduleIds = manualDeps.get(normalizePath(path));
                if (!moduleIds) {
                    return;
                }

                isDebug && debug(`File changed: ${path}`);
                metadata.onFileChanged(path);
                for (const moduleId of moduleIds) {
                    const mod = server.moduleGraph.getModuleById(moduleId);
                    if (mod) {
                        isDebug && debug(`Triggering hmr of ${moduleId}`);
                        server.reloadModule(mod).catch((err) => {
                            config.logger.error(`Failed to trigger hmr: ${err}`);
                        });
                    }
                }
            });
        },

        async resolveId(moduleId, importer) {
            if (moduleId === "open-pioneer:app") {
                if (!importer) {
                    this.error("Must be imported from a source file.");
                }
                return importer + "?" + APP_META_QUERY;
            }
        },

        async load(this: PluginContext, moduleId) {
            const virtualModule = parseVirtualAppModuleId(moduleId);
            if (!virtualModule) {
                return undefined;
            }

            const { type, importer } = virtualModule;
            if (type === "app-meta") {
                return generateAppMetadata(importer);
            }

            const pkgJsonPath = findPackageJson(dirname(importer), config.root);
            if (!pkgJsonPath) {
                this.error(`Failed to find package.json for app from '${importer}'.`);
            }

            const context = buildMetadataContext(this, moduleId, devServer, manualDeps);
            const appDir = dirname(pkgJsonPath);
            switch (type) {
                case "app-packages": {
                    const appMetadata = await metadata.getAppMetadata(context, appDir);
                    const generatedSourceCode = generatePackagesMetadata(appMetadata.packages);
                    isDebug && debug("Generated app metadata: %O", generatedSourceCode);
                    return generatedSourceCode;
                }
                case "app-css": {
                    const appMetadata = await metadata.getAppMetadata(context, appDir);
                    const generatedSourceCode = generateCombinedCss(appMetadata.packages);
                    isDebug && debug("Generated app css: %O", generatedSourceCode);
                    return generatedSourceCode;
                }
            }
        }
    };
}

// Patches the addWatchFile function for manual watching
function buildMetadataContext(
    ctx: PluginContext,
    moduleId: string,
    devServer: ViteDevServer | undefined,
    manualDeps: Map<string, Set<string>>
): MetadataContext {
    return {
        warn: ctx.warn,
        error: ctx.error,
        resolve: ctx.resolve,
        addWatchFile: (id) => {
            if (devServer) {
                // TODO: Is there a better way? We want to trigger a hot reload when
                // one of the build.config files or package.json files change!
                isDebug && debug(`Adding manual watch for ${id}`);
                devServer.watcher.add(id);
                addManualDep(manualDeps, id, moduleId);
            }
            ctx.addWatchFile(id);
        }
    };
}

function addManualDep(manualDeps: Map<string, Set<string>>, file: string, moduleId: string) {
    const normalizedPath = normalizePath(file);
    let moduleIds = manualDeps.get(normalizedPath);
    if (!moduleIds) {
        moduleIds = new Set();
        manualDeps.set(normalizedPath, moduleIds);
    }
    moduleIds.add(moduleId);
}

function findPackageJson(startDir: string, rootDir: string) {
    let dir = startDir;
    while (dir) {
        const candidate = join(dir, "package.json");
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
