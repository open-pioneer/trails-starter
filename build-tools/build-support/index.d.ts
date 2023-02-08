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
     * UI configuration.
     */
    ui?: UiConfig;

    /**
     * Default values for properties that are supported by this package.
     * Properties may be overwritten by the application.
     *
     * Only plain old JSON data is allowed for values.
     */
    properties?: Record<string, unknown>;

    /**
     * Metadata about properties defined by this package.
     * Names in this record should match the property name in {@link properties}.
     */
    propertiesMeta?: Record<string, PropertyMetaConfig>;
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
    references?: (string | ReferenceConfig)[];
}

/**
 * Describes an interface provided by a service.
 */
export interface ProvidesConfig {
    /** Name of the interface that is provided by this service. */
    name: string;

    /**
     * An additional qualifier to disambiguate multiple implementations of the same interface.
     * This property should be set to a unique value if the interface is designed to support multiple implementations.
     */
    qualifier?: string;
}

/**
 * Describes a reference to an interface required by a service.
 */
export interface ReferenceConfig {
    /** Name of the interface that is referenced by this service. */
    name: string;

    /**
     * An additional qualifier to disambiguate an interface reference when there are multiple implementations.
     */
    qualifier?: string;

    /**
     * Set this to true to inject *all* implementations of the specified interface instead of a specific one.
     * When used from a service, this will inject the implementations as an array.
     *
     * Note that this option is mutually exclusive with {@link qualifier}.
     */
    all?: boolean;
}

/**
 * Describes additional configuration for a package property.
 */
export interface PropertyMetaConfig {
    /**
     * Required properties *must* be specified by an application
     * to a valid (non null or undefined) value.
     */
    required?: boolean;
}

/**
 * Accepts `config` as a {@link BuildConfig} object.
 * This is a helper function to provide type hints.
 *
 * @returns config
 */
export declare function defineBuildConfig(config: BuildConfig): BuildConfig;
