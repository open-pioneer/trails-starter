import { ErrorId } from "./../errors";
import { InterfaceReferenceMetadata, ServiceMetadata } from "../Metadata";
import { Service, ServiceConstructor, ServiceOptions } from "../Service";
import { Error } from "@open-pioneer/core";

export type Dependency = { name: string } & InterfaceReferenceMetadata;

export type ServiceState = "not-constructed" | "constructing" | "constructed" | "destroyed";

/**
 * Represents metadata and state of a service in the runtime.
 * `this.instance` is the actual service instance (when constructed).
 */
export class ServiceRepr {
    static parse(bundleName: string, data: ServiceMetadata): ServiceRepr {
        const clazz = data.clazz;
        const name = data.name;
        const dependencies = Object.entries(data.references ?? {}).map<Dependency>(
            ([name, referenceMetadata]) => {
                return {
                    name,
                    ...referenceMetadata
                };
            }
        );
        // TODO: Properties in metadata?
        const interfaces = (data.provides ?? []).map((p) => p.interface);
        return new ServiceRepr(name, bundleName, clazz, dependencies, interfaces, {});
    }

    /** Unique id of this service. Contains the bundle name and the service name. */
    readonly id: string;

    /** Name of this service in it's bundle. */
    readonly name: string;

    /** Name of the parent bundle. */
    readonly bundleName: string;

    /** Service properties made available via the service's constructor. */
    readonly properties: Readonly<Record<string, unknown>>;

    /** Dependencies required by the service constructor. */
    readonly dependencies: readonly Dependency[];

    /** Interfaces provided by the service. */
    readonly interfaces: readonly string[];

    /** Number of references to this service. */
    private useCount = 0;

    /** Service constructor. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private clazz: ServiceConstructor<any>;

    /** Current state of this service. "constructed" -> instance is available. */
    private _state: ServiceState = "not-constructed";

    /** Service instance, once constructed. */
    private _instance: Service | undefined = undefined;

    constructor(
        name: string,
        bundleName: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clazz: ServiceConstructor<any>,
        dependencies: Dependency[],
        interfaces: string[],
        properties: Record<string, unknown>
    ) {
        this.id = `${bundleName}::${name}`;
        this.name = name;
        this.bundleName = bundleName;
        this.clazz = clazz;
        this.dependencies = dependencies;
        this.interfaces = interfaces;
        this.properties = properties;
    }

    /** Returns the current service instance or undefined if the service has not been constructed. */
    get instance(): Service | undefined {
        return this._instance;
    }

    /** Returns the current state of the service. */
    get state() {
        return this._state;
    }

    /**
     * Same as `instance`, but throws when the instance has not been constructed.
     */
    getInstanceOrThrow() {
        const instance = this._instance;
        if (!instance) {
            throw new Error(ErrorId.INTERNAL, "Expected service instance to be present.");
        }
        return instance;
    }

    beforeCreate() {
        if (this._state === "not-constructed") {
            this._state = "constructing";
        } else {
            throw new Error(
                ErrorId.INTERNAL,
                "Inconsistent state: service is already under construction."
            );
        }
    }

    /**
     * Instantiates the service by invoking the service constructor 
     * with the given `options`.
     * 
     * The service's use count is initialized to `1`, so every `create()`
     * should be paired with a `removeRef()`.
     * 
     * `destroy()` can be invoked once the final `removeRef()` has returned zero. 
     */
    create(options: ServiceOptions) {
        if (this._state !== "constructing" || this.instance !== undefined) {
            throw new Error(
                ErrorId.INTERNAL,
                "Inconsistent state: service is not being constructed."
            );
        }
        try {
            this._instance = new this.clazz(options);
            this._state = "constructed";
            this.useCount = 1;
            return this._instance;
        } catch (e) {
            throw new Error(
                ErrorId.SERVICE_CONSTRUCTION_FAILED,
                `Failed to create service '${this.id}'.`,
                { cause: e }
            );
        }
    }

    destroy() {
        if (this._instance) {
            try {
                this._instance.destroy?.();
            } catch (e) {
                throw new Error(
                    ErrorId.SERVICE_DESTRUCTION_FAILED,
                    `Failed to destroy service '${this.id}'.`,
                    { cause: e }
                );
            }
        }
        this._instance = undefined;
        this._state = "destroyed";
    }

    /**
     * Adds a use to the service's use count.
     * References to a service are tracked: it should only be destroyed when it is no longer being used.
     */
    addRef() {
        return this.useCount += 1;
    }

    /**
     * Removes a use from the service's use count.
     * Returns the new use count.
     */
    removeRef() {
        return this.useCount -= 1;
    }
}
