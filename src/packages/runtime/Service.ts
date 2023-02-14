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
 * Options passed to a service's constructor.
 */
export type ServiceOptions<References extends {} = {}> = {
    /**
     * References to other services.
     * These are injected by the runtime and match the declared references of the service.
     */
    references: References;

    /**
     * Configuration properties.
     */
    properties: Record<string, unknown>;
};

/**
 * A service constructor returns a service instance when calling `new`.
 */
export type ServiceConstructor<References extends {} = {}, Interface extends {} = {}> = {
    new (options: ServiceOptions<References>): Service<Interface>;
};
