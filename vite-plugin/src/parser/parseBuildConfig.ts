export const BUILD_CONFIG_NAME = "build.config.mjs";

export interface NormalizedPackageConfig {
    services: Record<string, NormalizedServiceConfig>;
}

export interface NormalizedServiceConfig {
    provides: ProvidesConfig[];
    references: Record<string, ReferenceConfig>;
}

export interface PackageConfig {
    /**
     * Services provided by this package.
     * The service name must match an exported class from the package's main entry point (usually `index.{js,ts}`).
     */
    services?: Record<string, ServiceConfig>;
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
    const importedModule = (await import(`${path}?id=${++requestId}`)) as Record<string, unknown>;
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

function normalizeConfig(rawConfig: PackageConfig): NormalizedPackageConfig {
    return {
        services: Object.fromEntries(
            Object.entries(rawConfig.services ?? {}).map(([serviceName, serviceConfig]) => {
                return [serviceName, normalizeServiceConfig(serviceConfig)];
            })
        )
    };
}

function normalizeServiceConfig(rawConfig: ServiceConfig): NormalizedServiceConfig {
    return {
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
