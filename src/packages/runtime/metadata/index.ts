import { ServiceConstructor } from "../Service";

/**
 * Describes a package to the runtime.
 */
export interface PackageMetadata {
    /** The globally unique name of the package. */
    name: string;

    /**
     * Collection of services defined in the package.
     *
     * Key: unique service name within the package.
     * Value: service metadata.
     */
    services: Record<string, ServiceMetadata>;
}

/**
 * Describes a service to the runtime.
 */
export interface ServiceMetadata {
    /** The unique name of the service in its package. */
    name: string;

    /** Service constructor responsible for creating a new instance. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clazz: ServiceConstructor<any>;

    /**
     * Collection of references to other services.
     * The runtime will inject the required services when possible
     * or provide a diagnostic if not.
     *
     * Key: reference name.
     * Value: reference metadata.
     */
    references?: Record<string, InterfaceReferenceMetadata>;

    /**
     * Lists interfaces provided by this service.
     */
    provides?: ProvidedInterfaceMetadata[];
}

/**
 * Describes a service reference to the runtime.
 */
export interface InterfaceReferenceMetadata {
    /** The name of the referenced interface. */
    interface: string;
}

/**
 * Describes a provided interface to the runtime.
 */
export interface ProvidedInterfaceMetadata {
    /** The name of the provided interface. */
    interface: string;
}
