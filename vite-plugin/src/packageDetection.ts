import { readFile, realpath } from "fs/promises";
import { dirname, join } from "path";
import { PluginContext } from "rollup";
import { normalizePath } from "vite";
import { createDebugger } from "./debug";
import { fileExists } from "./fileUtils";
import { PackageInfo } from "./metadataGeneration";
const isDebug = !!process.env.DEBUG;
const debug = createDebugger("open-pioneer:package-detection");

let requestId = 0;

export async function detectPackagesInApp(
    ctx: PluginContext,
    appDir: string
): Promise<PackageInfo[]> {
    // List of packages with a build configuration.
    // key: package name
    const foundPackages = new Map<string, PackageInfo>();

    // Key: package path on disk.
    const seenDirectory = new Set<string>();

    // Called recursively on all referenced packages.
    // Stops when a package without a build.config file is detected.
    const visitDirectory = async (dir: string, kind: "app" | "package") => {
        const resolvedDir = await realpath(dir);
        isDebug && debug(`Visiting directory ${resolvedDir} as ${kind}.`);

        const packageJsonPath = join(resolvedDir, "package.json");
        ctx.addWatchFile(normalizePath(packageJsonPath));
        if (!(await fileExists(packageJsonPath))) {
            ctx.error(`Expected a 'package.json' file at ${packageJsonPath}.`);
        }

        // Read package.json for basic package metadata.
        let packageJsonContent;
        try {
            packageJsonContent = JSON.parse(await readFile(packageJsonPath, "utf-8"));
        } catch (e) {
            ctx.error(`Failed to read ${packageJsonPath}: ${e}`);
        }

        const packageName = packageJsonContent.name;
        if (typeof packageName !== "string") {
            ctx.error(`Expected 'name' to be a string in ${packageJsonPath}.`);
        }

        // Detect pioneer package metadata.
        if (kind === "package") {
            const buildConfigPath = join(resolvedDir, "build.config.mjs");

            // TODO: Only consider packages in source root?
            ctx.addWatchFile(normalizePath(buildConfigPath));
            if (!(await fileExists(buildConfigPath))) {
                // Not a pioneer package.
                return;
            }

            // TODO: Parse metadata correctly
            const metadata = (await import(`${buildConfigPath}?id=${++requestId}`)).default;
            isDebug && debug(`Metadata of ${buildConfigPath}: %O`, metadata);

            const existingPackage = foundPackages.get(packageName);
            if (existingPackage) {
                if (existingPackage.location !== resolvedDir) {
                    ctx.error(
                        `Found package '${packageName}' at two different locations ${existingPackage.location} and ${resolvedDir}.`
                    );
                }
            } else {
                isDebug && debug(`Recording location of '${packageName}' to ${resolvedDir}.`);
                foundPackages.set(packageName, {
                    name: packageName,
                    location: resolvedDir,
                    metadata
                });
            }
        }

        // Visit all direct dependencies.
        const dependencies = packageJsonContent?.dependencies ?? {};
        const recursiveJobs = Object.keys(dependencies).map(async (dependencyName) => {
            const dependencyPackageJsonProbe = `${dependencyName}/package.json`;
            const probeResult = await ctx.resolve(dependencyPackageJsonProbe, packageJsonPath, {
                skipSelf: true
            });
            if (!probeResult || probeResult.external) {
                ctx.error(
                    `Request for '${dependencyPackageJsonProbe}' did not result in a local file (required by '${dir}').`
                );
            }

            const dependencyDir = dirname(probeResult.id);
            if (seenDirectory.has(dependencyDir)) {
                isDebug && debug(`Skipping ${dependencyDir} (already seen).`);
                return;
            }
            seenDirectory.add(dependencyDir);
            await visitDirectory(dependencyDir, "package");
        });
        return await Promise.all(recursiveJobs);
    };

    await visitDirectory(appDir, "app");
    return Array.from(foundPackages.values());
}
