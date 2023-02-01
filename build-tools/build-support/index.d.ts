/**
 * Schema for `build.config.mjs` files.
 */
export interface BuildConfig {
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

/**
 * Describes a single service.
 */
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

/**
 * Describes a package's UI.
 */
export interface UiConfig {
    /**
     * Interfaces names of the services referenced by the UI.
     * The UI can only use services that are declared as dependencies in this array.
     */
    references?: string[];
}

/**
 * Describes an interface provided by a service.
 */
export interface ProvidesConfig {
    /** Name of the interface that is provided by this service. */
    name: string;
}

/**
 * Describes a reference to an interface required by a service.
 */
export interface ReferenceConfig {
    /** Name of the interface that is referenced by this service. */
    name: string;
}

/**
 * Accepts `config` as a {@link BuildConfig} object.
 * This is a helper function to provide type hints.
 *
 * @returns config
 */
export declare function defineBuildConfig(config: BuildConfig): BuildConfig;
