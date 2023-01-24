import { readFile, realpath } from "fs/promises";
import { dirname, join } from "path";
import { PluginContext } from "rollup";
import { normalizePath } from "vite";
import { createDebugger } from "../utils/debug";
import { fileExists } from "../utils/fileUtils";
import { BUILD_CONFIG_NAME, loadBuildConfig, NormalizedPackageConfig } from "./parseBuildConfig";
const isDebug = !!process.env.DEBUG;
const debug = createDebugger("open-pioneer:package-detection");

/**
 * Contains build-time information about an app.
 */
export interface AppInfo {
    /** App name. */
    name: string;

    /** Directory on disk. */
    directory: string;

    /** Path to package.json file. */
    packageJsonPath: string;

    /** Packages used by the app. */
    packages: PackageInfo[];
}

/**
 * Contains build-time information about a package.
 */
export interface PackageInfo {
    /** Package name. */
    name: string;

    /** Directory on disk. */
    directory: string;

    /** Path to package.json file. */
    packageJsonPath: string;

    /** Path to entry point (contains service exports). */
    entryPointPath: string;

    /** Runtime dependencies (from package.json). */
    dependencies: string[];

    /** Parsed metadata (from build config file). */
    config: NormalizedPackageConfig;
}

export type AppInfoContext = Pick<PluginContext, "addWatchFile" | "resolve" | "error">;

export async function parseAppInfo(ctx: AppInfoContext, appDir: string): Promise<AppInfo> {
    // Deduplicated package jobs (visit only once).
    // Key: path on disk
    const packageJobs = new Map<string, Promise<unknown>>();

    // Check that packages only exist once in the build.
    // Key: package name
    // Value: seen location on disk
    const seenPackages = new Map<string, string>();

    // Visits the given dependencies that have not yet been visited and returns their info.
    const visitDependencies = async (
        dependencies: string[],
        importer: string
    ): Promise<PackageInfo[]> => {
        const jobs = dependencies.map(async (dependencyName) => {
            const dependencyPackageJsonProbe = `${dependencyName}/package.json`;
            const probeResult = await ctx.resolve(dependencyPackageJsonProbe, importer, {
                skipSelf: true
            });
            if (!probeResult || probeResult.external) {
                ctx.error(
                    `Request for '${dependencyPackageJsonProbe}' did not result in a local file (required by '${importer}').`
                );
            }

            const dependencyDir = dirname(probeResult.id);
            return visitPackage(dependencyDir);
        });
        return (await Promise.all(jobs)).flat();
    };

    // Visits a package and its dependencies.
    // Returns the merged
    const visitPackageImpl = async (packageDir: string): Promise<PackageInfo[]> => {
        isDebug && debug(`Visiting package directory ${packageDir}.`);

        const {
            name: packageName,
            path: packageJsonPath,
            dependencies
        } = await parsePackageJson(ctx, packageDir);
        ctx.addWatchFile(packageJsonPath);

        const buildConfigPath = join(packageDir, BUILD_CONFIG_NAME);

        // TODO: Only consider packages in source root?
        // TODO: Better detection (e.g. type in config file)
        ctx.addWatchFile(normalizePath(buildConfigPath));
        if (!(await fileExists(buildConfigPath))) {
            isDebug && debug(`Skipping ${packageDir} because it is not a pioneer package.`);
            return [];
        }

        // TODO: Parse metadata correctly
        let buildConfig: NormalizedPackageConfig;
        try {
            buildConfig = await loadBuildConfig(buildConfigPath);
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ctx.error((e as any).message || "Failed to load build config");
        }

        isDebug && debug(`Metadata of ${buildConfigPath}: %O`, buildConfig);

        const existingPackage = seenPackages.get(packageName);
        if (existingPackage) {
            ctx.error(
                `Found package '${packageName}' at two different locations ${existingPackage} and ${packageDir}`
            );
        }
        isDebug && debug(`Recording location of '${packageName}' to ${packageDir}`);
        seenPackages.set(packageName, packageDir);

        const depsInfo = await visitDependencies(dependencies, packageJsonPath);
        return [
            {
                name: packageName,
                directory: packageDir,
                packageJsonPath: packageJsonPath,
                entryPointPath: join(packageDir, "index.ts"), // TODO hardcoded
                dependencies,
                config: buildConfig
            },
            ...depsInfo
        ];
    };

    // Visits the package if it has not been visited before.
    const visitPackage = async (dir: string): Promise<PackageInfo[]> => {
        const packageDir = await realpath(dir);
        const job = packageJobs.get(packageDir);
        if (job) {
            isDebug && debug(`Skipping ${packageDir} because it is already being visited.`);
            return []; // Don't visit more than once
        }

        const newJob = visitPackageImpl(packageDir);
        packageJobs.set(packageDir, newJob);
        return newJob;
    };

    const visitApp = async (dir: string): Promise<AppInfo> => {
        const directory = await realpath(dir);
        isDebug && debug(`Visiting app directory ${directory}.`);

        const {
            name: appName,
            path: packageJsonFile,
            dependencies
        } = await parsePackageJson(ctx, directory);
        ctx.addWatchFile(packageJsonFile);

        return {
            name: appName,
            packageJsonPath: packageJsonFile,
            directory: directory,
            packages: await visitDependencies(dependencies, packageJsonFile)
        };
    };

    return await visitApp(appDir);
}

async function parsePackageJson(ctx: AppInfoContext, dir: string) {
    const packageJsonPath = join(dir, "package.json");
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
        path: packageJsonPath,
        dependencies: dependencyNames
    };
}
