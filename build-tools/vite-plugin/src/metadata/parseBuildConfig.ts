import { pathToFileURL } from "node:url";
import {
    BuildConfig,
    ProvidesConfig,
    ReferenceConfig,
    ServiceConfig
} from "@open-pioneer/build-support";
import { verifyBuildConfigSchema } from "./BuildConfigSchema";

export const BUILD_CONFIG_NAME = "build.config.mjs";

export interface NormalizedPackageConfig {
    services: NormalizedServiceConfig[];
    styles: string | undefined;
    ui: NormalizedUiConfig;
}

export interface NormalizedServiceConfig {
    name: string;
    provides: ProvidesConfig[];
    references: Record<string, ReferenceConfig>;
}

export interface NormalizedUiConfig {
    references: string[];
}

let requestId = 0;

/**
 * Loads and parses a build configuration file from the given path on disk.
 */
export async function loadBuildConfig(path: string): Promise<NormalizedPackageConfig> {
    const fileURL = pathToFileURL(path);
    const importedModule = (await import(`${fileURL}?id=${++requestId}`)) as Record<
        string,
        unknown
    >;
    if (!importedModule || !importedModule.default) {
        throw new Error(`${path} must contain a default export.`);
    }

    const config = importedModule.default;
    return parseBuildConfig(config);
}

/**
 * Parses a build configuration object and validates it.
 */
export function parseBuildConfig(object: unknown): NormalizedPackageConfig {
    const rawConfig = verifyBuildConfigSchema(object);
    return normalizeConfig(rawConfig);
}

const BUILD_CONFIG_RE = /[\\/]build\.config\.mjs($|\?)/;

export function isBuildConfig(file: string) {
    return BUILD_CONFIG_RE.test(file);
}

function normalizeConfig(rawConfig: BuildConfig): NormalizedPackageConfig {
    return {
        styles: rawConfig.styles,
        services: Object.entries(rawConfig.services ?? {}).map(([serviceName, serviceConfig]) => {
            return normalizeServiceConfig(serviceName, serviceConfig);
        }),
        ui: normalizeUiConfig(rawConfig.ui)
    };
}

function normalizeServiceConfig(name: string, rawConfig: ServiceConfig): NormalizedServiceConfig {
    return {
        name: name,
        provides: normalizeProvidesConfig(rawConfig.provides),
        references: normalizeReferencesConfig(rawConfig.references)
    };
}

function normalizeProvidesConfig(rawConfig: ServiceConfig["provides"]): ProvidesConfig[] {
    if (!rawConfig) {
        return [];
    }

    if (typeof rawConfig === "string") {
        return [
            {
                name: rawConfig
            }
        ];
    }

    return rawConfig.map((providesConfig) => {
        const normalized: ProvidesConfig =
            typeof providesConfig === "string" ? { name: providesConfig } : providesConfig;
        return normalized;
    });
}

function normalizeReferencesConfig(
    rawConfig: ServiceConfig["references"]
): Record<string, ReferenceConfig> {
    if (!rawConfig) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(rawConfig).map(([referenceName, referenceConfig]) => {
            const normalized: ReferenceConfig =
                typeof referenceConfig === "string" ? { name: referenceConfig } : referenceConfig;
            return [referenceName, normalized];
        })
    );
}

function normalizeUiConfig(rawConfig: BuildConfig["ui"]): NormalizedUiConfig {
    return {
        references: rawConfig?.references ?? []
    };
}
