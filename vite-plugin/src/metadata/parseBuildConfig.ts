import { pathToFileURL } from "node:url";

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

export interface PackageConfig {
    /**
     * Path to a file containing CSS.
     * The CSS file will be automatically loaded when the package
     * is part of an application.
     */
    styles?: string;

    /**
     * Services provided by this package.
     * The service name must match an exported class from the package's main entry point (usually `index.{js,ts}`).
     */
    services?: Record<string, ServiceConfig>;

    /**
     * Ui configuration.
     */
    ui?: UiConfig;
}

export interface ServiceConfig {
    /**
     * Declarations of interfaces provided by this service.
     *
     * The interface name can be specified directly (as a string) for convenience.
     */
    provides?: string | (string | ProvidesConfig)[];

    /**
     * Declares references to other services.
     * References will be injected into the service's constructor.
     *
     * The interface name can be specified directly (as a string) for convenience.
     */
    references?: Record<string, string | ReferenceConfig>;
}

export interface UiConfig {
    /**
     * Interfaces names of the services referenced by the UI.
     * The UI can only use services that are declared as dependencies in this array.
     */
    references?: string[];
}

export interface ProvidesConfig {
    /** Name of the interface that is provided by this service. */
    name: string;
}

export interface ReferenceConfig {
    /** Name of the interface that is referenced by this service. */
    name: string;
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
    const rawConfig = object as PackageConfig; // TODO validate schema
    return normalizeConfig(rawConfig);
}

const BUILD_CONFIG_RE = /[\\/]build\.config\.mjs($|\?)/;

export function isBuildConfig(file: string) {
    return BUILD_CONFIG_RE.test(file);
}

function normalizeConfig(rawConfig: PackageConfig): NormalizedPackageConfig {
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

function normalizeUiConfig(rawConfig: PackageConfig["ui"]): NormalizedUiConfig {
    return {
        references: rawConfig?.references ?? []
    };
}
