import { readFile, realpath } from "fs/promises";
import { dirname, join } from "path";
import { PluginContext } from "rollup";
import { normalizePath } from "vite";
import { createDebugger } from "../utils/debug";
import { fileExists, isInDirectory } from "../utils/fileUtils";
import {
    BUILD_CONFIG_NAME,
    isBuildConfig,
    loadBuildConfig,
    NormalizedPackageConfig
} from "./parseBuildConfig";

const isDebug = !!process.env.DEBUG;
const debug = createDebugger("open-pioneer:metadata");

/**
 * Contains build-time information about an app.
 */
export interface AppMetadata {
    /** App name. */
    name: string;

    /** Directory on disk. */
    directory: string;

    /** Path to package.json file. */
    packageJsonPath: string;

    /**
     * Packages used by the app.
     * Includes the app package itself!
     */
    packages: PackageMetadata[];
}

/**
 * Contains build-time information about a package.
 */
export interface PackageMetadata {
    /** Package name. */
    name: string;

    /** Directory on disk. */
    directory: string;

    /** Path to package.json file. */
    packageJsonPath: string;

    /** Path to entry point (contains service exports). */
    entryPointPath: string | undefined;

    /** Path to the resolved css file (if any). */
    cssFilePath: string | undefined;

    /** Runtime dependencies (from package.json). */
    dependencies: string[];

    /** Parsed metadata (from build config file). */
    config: NormalizedPackageConfig;
}

export type MetadataContext = Pick<PluginContext, "addWatchFile" | "resolve" | "error" | "warn">;

export interface ResolvedPackageLocation {
    type: "absolute";
    directory: string;
}

export interface UnresolvedPackageLocation {
    type: "unresolved";
    packageName: string;
    importedFrom: string;
}

export type PackageLocation = ResolvedPackageLocation | UnresolvedPackageLocation;

/**
 * Provides metadata about apps and packages.
 * Metadata is read from disk on demand and will then be cached
 * until one of the file dependencies has changed.
 */
export class MetadataRepository {
    private sourceRoot: string;

    // Key: package directory on disk, value: existing metadata
    private packageMetadataCache = new Map<string, PackageMetadata>();

    // Key: package name (known to cache), value: metadata
    private packageMetadataByName = new Map<string, PackageMetadata>();

    // Deduplicated jobs (only visit a directory once).
    // Key: package directory on disk
    private packageMetadataJobs = new Map<string, Promise<PackageMetadata>>();

    /**
     * @param sourceRoot Source folder on disk, needed to detect 'local' packages
     */
    constructor(sourceRoot: string) {
        this.sourceRoot = sourceRoot;
    }

    reset() {
        this.packageMetadataCache.clear();
        this.packageMetadataJobs.clear();
    }

    onFileChanged(path: string) {
        if (isPackageJson(path) || isBuildConfig(path)) {
            this.invalidatePackageMetadata(dirname(path));
        }
    }

    async getAppMetadata(ctx: MetadataContext, appDirectory: string): Promise<AppMetadata> {
        isDebug && debug(`Request for app metadata of ${appDirectory}`);

        const appPackageMetadata = await this.getPackageMetadata(ctx, {
            type: "absolute",
            directory: appDirectory
        });
        if (!appPackageMetadata) {
            ctx.error(
                `Failed to parse app metadata in ${appDirectory}. Ensure that the app is a valid local package.`
            );
        }

        // Map to ensure that we don't return duplicates. Key: package name
        const packageMetadataByName = new Map<string, PackageMetadata>();
        packageMetadataByName.set(appPackageMetadata.name, appPackageMetadata);

        // Recursively visit all dependencies.
        // Detected metadata is placed into `packageMetadata`.
        const visitDependencies = async (dependencies: string[], importedFrom: string) => {
            const jobs = dependencies.map(async (packageName) => {
                const packageMetadata = await this.getPackageMetadata(ctx, {
                    type: "unresolved",
                    packageName,
                    importedFrom
                });
                if (packageMetadata) {
                    if (!packageMetadataByName.has(packageMetadata.name)) {
                        packageMetadataByName.set(packageMetadata.name, packageMetadata);
                    }
                    await visitDependencies(
                        packageMetadata.dependencies,
                        packageMetadata.packageJsonPath
                    );
                }
            });
            return await Promise.all(jobs);
        };
        await visitDependencies(
            appPackageMetadata.dependencies,
            appPackageMetadata.packageJsonPath
        );

        const appMetadata: AppMetadata = {
            name: appPackageMetadata.name,
            directory: appPackageMetadata.directory,
            packageJsonPath: appPackageMetadata.packageJsonPath,
            packages: Array.from(packageMetadataByName.values())
        };
        return appMetadata;
    }

    async getPackageMetadata(
        ctx: MetadataContext,
        loc: PackageLocation
    ): Promise<PackageMetadata | undefined> {
        isDebug && debug(`Request for package metadata of ${formatPackageLocation(loc)}`);

        const packageDir = await this.resolvePackageLocation(ctx, loc);

        // This would have to be changed when packages from the 'outside' are also supported in the future.
        if (!isLocalPackage(packageDir, this.sourceRoot)) {
            isDebug && debug(`Skipping non-local package '${packageDir}'.`);
            return undefined;
        }

        // Check the cache
        const cachedMetadata = this.getPackageMetadataFromCache(packageDir);
        if (cachedMetadata) {
            isDebug && debug(`Returning cached metadata for '${cachedMetadata.name}'`);
            return cachedMetadata;
        }
        return await this.schedulePackageMetadataJob(ctx, packageDir);
    }

    private async schedulePackageMetadataJob(ctx: MetadataContext, packageDir: string) {
        // Deduplicate concurrent jobs for the same directory.
        const jobs = this.packageMetadataJobs;
        let job = jobs.get(packageDir);
        if (!job) {
            isDebug && debug(`Analyzing package at ${packageDir}`);
            job = parsePackageMetadata(ctx, packageDir)
                .then((packageMetadata) => {
                    isDebug && debug(`Metadata for '${packageMetadata.name}': %O`, packageMetadata);
                    if (jobs.get(packageDir) === job) {
                        this.putPackageMetadataInCache(packageDir, packageMetadata, (message) => {
                            ctx.error(message);
                        });
                    }
                    return packageMetadata;
                })
                .finally(() => {
                    if (jobs.get(packageDir) === job) {
                        jobs.delete(packageDir);
                    }
                });
            this.packageMetadataJobs.set(packageDir, job);
        } else {
            isDebug && debug(`Waiting for existing analysis of ${packageDir}`);
        }
        return await job;
    }

    private getPackageMetadataFromCache(packageDir: string): PackageMetadata | undefined {
        return this.packageMetadataCache.get(packageCacheKey(packageDir));
    }

    private putPackageMetadataInCache(
        packageDir: string,
        metadata: PackageMetadata,
        onError: (message: string) => never
    ) {
        const name = metadata.name;
        const key = packageCacheKey(packageDir);

        // Ensure only one version of a package exists in the app
        const existingMetadata = this.packageMetadataByName.get(name);
        if (existingMetadata && existingMetadata.directory !== metadata.directory) {
            onError(
                `Found package '${name}' at two different locations ${existingMetadata.directory} and ${metadata.directory}`
            );
        }

        this.packageMetadataCache.set(key, metadata);
        this.packageMetadataByName.set(name, metadata);
    }

    private invalidatePackageMetadata(packageDir: string) {
        const key = packageCacheKey(packageDir);
        const metadata = this.packageMetadataCache.get(key);
        if (metadata) {
            this.packageMetadataByName.delete(metadata.name);
            this.packageMetadataCache.delete(key);
        }
    }

    private async resolvePackageLocation(ctx: MetadataContext, loc: PackageLocation) {
        if (loc.type === "absolute") {
            return await realpath(loc.directory);
        }

        // Try to locate the package via rollup resolve.
        const unresolvedPackageJson = `${loc.packageName}/package.json`;
        const packageJsonLocation = await ctx.resolve(
            unresolvedPackageJson,
            normalizePath(loc.importedFrom),
            {
                skipSelf: true
            }
        );
        if (!packageJsonLocation || packageJsonLocation.external) {
            ctx.error(
                `Request for '${unresolvedPackageJson}' did not result in a local file (required by '${loc.importedFrom}').`
            );
        }

        const packageDir = await realpath(dirname(packageJsonLocation.id));
        isDebug && debug(`Found package '${loc.packageName}' at ${packageDir}`);
        return packageDir;
    }
}

function packageCacheKey(packageDir: string) {
    return normalizePath(packageDir);
}

export async function parsePackageMetadata(
    ctx: MetadataContext,
    packageDir: string
): Promise<PackageMetadata> {
    isDebug && debug(`Visiting package directory ${packageDir}.`);

    const packageJsonPath = join(packageDir, "package.json");

    ctx.addWatchFile(packageJsonPath);
    const { name: packageName, dependencies } = await parsePackageJson(ctx, packageJsonPath);

    const buildConfigPath = join(packageDir, BUILD_CONFIG_NAME);
    let buildConfig: NormalizedPackageConfig | undefined;
    ctx.addWatchFile(normalizePath(buildConfigPath));
    if (await fileExists(buildConfigPath)) {
        try {
            buildConfig = await loadBuildConfig(buildConfigPath);
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (e as any).message || "Unknown error";
            ctx.error(`Failed to load build config ${buildConfigPath}: ${msg}`);
        }
    } else {
        ctx.error(`Expected a ${BUILD_CONFIG_NAME} in ${packageDir}`);
    }

    let entryPoint: string | undefined;
    if (buildConfig.services.length) {
        try {
            entryPoint = (await ctx.resolve(packageDir))?.id;
        } catch (e) {
            ctx.warn(`Failed to resolve entry point for package ${packageDir}: ${e}`);
        }
    }

    let cssFile: string | undefined;
    if (buildConfig.styles) {
        try {
            cssFile = await resolveLocalFile(ctx, packageDir, buildConfig.styles);
        } catch (e) {
            ctx.error(`Failed to resolve css file for package ${packageDir}: ${e}`);
        }
        if (!cssFile) {
            ctx.error(`Failed to find css file '${buildConfig.styles}' in ${packageDir}`);
        }
    }

    return {
        name: packageName,
        directory: packageDir,
        packageJsonPath: packageJsonPath,
        entryPointPath: entryPoint,
        cssFilePath: cssFile,
        dependencies,
        config: buildConfig
    };
}

async function parsePackageJson(ctx: MetadataContext, packageJsonPath: string) {
    if (!(await fileExists(packageJsonPath))) {
        ctx.error(`Expected a 'package.json' file at ${packageJsonPath}`);
    }

    let packageJsonContent;
    try {
        packageJsonContent = JSON.parse(await readFile(packageJsonPath, "utf-8"));
    } catch (e) {
        ctx.error(`Failed to read ${packageJsonPath}: ${e}`);
    }

    const packageName = packageJsonContent.name;
    if (typeof packageName !== "string") {
        ctx.error(`Expected 'name' to be a string in ${packageJsonPath}`);
    }

    const dependencies = packageJsonContent.dependencies ?? {};
    if (typeof dependencies !== "object") {
        ctx.error(`Expected a valid 'dependencies' object in ${packageJsonPath}`);
    }

    const dependencyNames = Object.keys(dependencies);
    return {
        name: packageName,
        dependencies: dependencyNames
    };
}

async function resolveLocalFile(ctx: MetadataContext, packageDir: string, localModuleId: string) {
    const result = await ctx.resolve(`./${localModuleId}`, `${packageDir}/package.json`, {
        skipSelf: true
    });
    return result?.id;
}

function formatPackageLocation(loc: PackageLocation) {
    switch (loc.type) {
        case "absolute":
            return `${loc.directory}`;
        case "unresolved":
            return `'${loc.packageName}' required by ${loc.importedFrom}`;
    }
}

const NODE_MODULES_RE = /[\\/]node_modules[\\/]/;

function isLocalPackage(file: string, sourceDir: string) {
    return isInDirectory(file, sourceDir) && !NODE_MODULES_RE.test(file);
}

const PACKAGE_JSON_RE = /[\\/]package\.json($|\?)/;

function isPackageJson(file: string) {
    return PACKAGE_JSON_RE.test(file);
}
