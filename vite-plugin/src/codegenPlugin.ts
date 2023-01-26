import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { PluginContext } from "rollup";
import { normalizePath, Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { createDebugger } from "./utils/debug";
import { generatePackagesMetadata } from "./codegen/metadataGeneration";
import { MetadataContext, MetadataRepository } from "./metadata/MetadataRepository";

const isDebug = !!process.env.DEBUG;
const debug = createDebugger("open-pioneer:codegen");

const APP_META_RE = /[?&]pioneer-packages($|&)/;
const SOURCE_FILE_RE = /^(.*?)(\?|$)/;

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
            if (moduleId.match(APP_META_RE)) {
                const importer = getSourceFile(moduleId);
                const pkgJsonPath = findPackageJson(dirname(importer), config.root);
                if (!pkgJsonPath) {
                    this.error(`Failed to find package.json for app from '${importer}'.`);
                }

                const context: MetadataContext = {
                    warn: this.warn,
                    error: this.error,
                    resolve: this.resolve,
                    addWatchFile: (id) => {
                        if (devServer) {
                            // TODO: Is there a better way? We want to trigger a hot reload when
                            // one of the build.config files or package.json files change!
                            isDebug && debug(`Adding manual watch for ${id}`);
                            devServer.watcher.add(id);
                            addManualDep(manualDeps, id, moduleId);
                        }
                        this.addWatchFile(id);
                    }
                };
                const appMetadata = await metadata.getAppMetadata(context, dirname(pkgJsonPath));
                const generatedSourceCode = generatePackagesMetadata(appMetadata.packages);
                isDebug && debug("Generated source content: %O", generatedSourceCode);
                return generatedSourceCode;
            }
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

function getSourceFile(moduleId: string) {
    const sourceFile = moduleId.match(SOURCE_FILE_RE)?.[1];
    if (!sourceFile || moduleId[0] == "\0") {
        throw new Error(`Failed to get actual source file from '${moduleId}'.`);
    }
    return sourceFile;
}
