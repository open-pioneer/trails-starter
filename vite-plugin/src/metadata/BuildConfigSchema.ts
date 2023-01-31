import {z} from "zod";

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

const referenceConfigSchema = z.object({name: z.string()});

const providesConfigSchema = z.object({name: z.string()});

const uiConfigSchema = z.object({references: z.array(z.string()).optional()});

const servicesConfigSchema = z.object({
    provides: z.string().or(z.array(z.string().or(providesConfigSchema))).optional(), 
    references: z.record(z.string(), z.string().or(referenceConfigSchema)).optional()
});

const buildConfigSchema = z.object({
    styles: z.string().optional(),
    services: z.record(z.string(), servicesConfigSchema).optional(),
    ui: uiConfigSchema.optional()
});

export function verifyBuildConfigSchema(value: unknown) : BuildConfig {
    return buildConfigSchema.parse(value);
}

