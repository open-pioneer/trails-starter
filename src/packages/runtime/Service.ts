/** Lifecycle hooks supported by the service interface. */
export interface ServiceLifecycleHooks {
    /**
     * Destroys the component.
     * Should clean up all resources used by the component.
     */
    destroy?(): void;

    /*
     * Just used so that this interface is not empty.
     * TypeScript would otherwise throw an 'no common properties' error
     * if one tries to implement this interface without providing any
     * lifecycle hooks.
     */
    toString(): string;
}

export type Service<Interface extends {} = {}> = ServiceLifecycleHooks & Interface;

/**
 * Represents metadata for an injected reference.
 */
export interface ReferenceMeta {
    serviceId: string;
}

/**
 * Contains metadata about injected references.
 * The key for the reference metadata is the reference's name.
 */
export type ReferencesMeta<References extends {}> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [referenceName in keyof References]: References[referenceName] extends any[]
        ? ReferenceMeta[]
        : ReferenceMeta;
};

/**
 * Options passed to a service's constructor.
 */
export type ServiceOptions<References extends {} = {}> = {
    /**
     * References to other services.
     * These are injected by the runtime and match the declared references of the service.
     */
    references: References;

    /**
     * Metadata about the injected references.
     * The object contains one entry for every reference injected via `references` (under the same key).
     *
     * If a single service has been injected, `referencesMeta[key]` will be of type {@link ReferenceMeta}.
     * If multiple services have been injected, an array of {@link ReferenceMeta} will be provided instead,
     * where the indices match the order in the injected references array.
     */
    referencesMeta: ReferencesMeta<References>;

    /**
     * Configuration properties.
     *
     * Default values are taken from the package's configuration, but these can be overridden
     * by the application.
     */
    properties: Record<string, unknown>;
};

/**
 * A service constructor returns a service instance when calling `new`.
 */
export type ServiceConstructor<References extends {} = {}, Interface extends {} = {}> = {
    new (options: ServiceOptions<References>): Service<Interface>;
};
