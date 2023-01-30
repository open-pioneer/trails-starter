import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { PluginContext } from "rollup";
import { normalizePath, Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { createDebugger } from "./utils/debug";
import { generatePackagesMetadata } from "./codegen/generatePackagesMetadata";
import { MetadataContext, MetadataRepository } from "./metadata/MetadataRepository";
import { generateCombinedCss } from "./codegen/generateCombinedCss";
import { generateAppMetadata } from "./codegen/generateAppMetadata";
import { APP_META_QUERY, PACKAGE_HOOKS, parseVirtualAppModuleId } from "./codegen/shared";
import { readFile } from "node:fs/promises";
import { generateReactHooks } from "./codegen/generateReactHooks";

const isDebug = !!process.env.DEBUG;
const debug = createDebugger("open-pioneer:codegen");

export function codegenPlugin(): Plugin {
    // key: normalized path to package json.
    // value: set of module ids that must be invalidated.
    const manualDeps = new Map<string, Set<string>>();

    let config!: ResolvedConfig;
    let metadata!: MetadataRepository;
    let devServer: ViteDevServer | undefined;
    let runtimeModuleId!: string;
    return {
        name: "pioneer:codegen",

        async buildStart(this: PluginContext) {
            manualDeps.clear();
            metadata?.reset();

            const unresolvedRuntimeModuleId = "@open-pioneer/runtime/react-integration";
            // TODO: use require.resolve instead (requires built js).
            const runtimeResolveResult = await this.resolve(unresolvedRuntimeModuleId, __filename);
            if (!runtimeResolveResult) {
                this.error(`Failed to find '${unresolvedRuntimeModuleId}'.`);
            }
            runtimeModuleId = runtimeResolveResult.id;
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

        async resolveId(this: PluginContext, moduleId, importer) {
            if (moduleId === "open-pioneer:app") {
                if (!importer) {
                    this.error("Must be imported from a source file.");
                }
                return importer + "?" + APP_META_QUERY;
            }
            if (moduleId === "open-pioneer:react-hooks") {
                if (!importer) {
                    this.error("Must be imported from a source file.");
                }

                const packageJsonPath = findPackageJson(dirname(importer), config.root);
                if (!packageJsonPath) {
                    this.error(`Failed to find package.json for package from '${importer}'.`);
                }
                return `${dirname(packageJsonPath)}/${PACKAGE_HOOKS}`;
            }
        },

        async load(this: PluginContext, moduleId) {
            const virtualModule = parseVirtualAppModuleId(moduleId);
            if (!virtualModule) {
                return undefined;
            }

            if (virtualModule.type === "package-hooks") {
                const directory = virtualModule.packageDirectory;
                const packageJsonPath = (await this.resolve(join(directory, "package.json")))?.id;
                if (!packageJsonPath) {
                    this.error(`Failed to resolve package.json in ${directory}`);
                }

                const packageName = await getPackageName(this, packageJsonPath);
                const generatedSourceCode = generateReactHooks(packageName, runtimeModuleId);
                isDebug && debug("Generated hooks code: %O", generatedSourceCode);
                return generatedSourceCode;
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

async function getPackageName(ctx: PluginContext, packageJsonPath: string) {
    let name: string;
    try {
        const content = await readFile(packageJsonPath, "utf-8");
        name = JSON.parse(content).name;
    } catch (e) {
        ctx.error(`Failed to read package.json file: ${e}`);
    }
    if (!name) {
        ctx.error(`Failed to read package name from '${packageJsonPath}'.`);
    }
    return name;
}
