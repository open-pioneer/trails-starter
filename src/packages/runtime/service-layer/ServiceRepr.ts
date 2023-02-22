import { ErrorId } from "../errors";
import { ServiceMetadata } from "../metadata";
import { Service, ServiceConstructor, ServiceOptions } from "../Service";
import { Error } from "@open-pioneer/core";
import { InterfaceSpec, parseReferenceSpec, ReferenceSpec } from "./InterfaceSpec";
import { PackageIntl } from "../i18n";

export type ServiceState = "not-constructed" | "constructing" | "constructed" | "destroyed";

export type ServiceDependency = ReferenceSpec & { referenceName: string };

export interface ConstructorFactory {
    type: "class";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clazz: ServiceConstructor<any>;
}

export interface FunctionFactory {
    type: "function";
    create: (options: ServiceOptions) => Service;
}

export type ServiceFactory = ConstructorFactory | FunctionFactory;

export interface ServiceReprOptions {
    name: string;
    packageName: string;
    factory: ServiceFactory;
    intl: PackageIntl;
    dependencies?: ServiceDependency[];
    interfaces?: InterfaceSpec[];
    properties?: Record<string, unknown>;
}

/**
 * Represents metadata and state of a service in the runtime.
 * `this.instance` is the actual service instance (when constructed).
 */
export class ServiceRepr {
    static create(
        packageName: string,
        data: ServiceMetadata,
        intl: PackageIntl,
        properties?: Record<string, unknown>
    ): ServiceRepr {
        const clazz = data.clazz;
        const name = data.name;
        const dependencies = Object.entries(data.references ?? {}).map(
            ([name, referenceMetadata]) => {
                return {
                    referenceName: name,
                    ...parseReferenceSpec(referenceMetadata)
                };
            }
        );
        const interfaces = data.provides?.map<InterfaceSpec>((i) => {
            return {
                interfaceName: i.name,
                qualifier: i.qualifier
            };
        });
        const factory: ConstructorFactory = {
            type: "class",
            clazz
        };
        return new ServiceRepr({
            name,
            packageName,
            factory,
            intl,
            dependencies,
            interfaces,
            properties
        });
    }

    /** Unique id of this service. Contains the package name and the service name. */
    readonly id: string;

    /** Name of this service in it's package. */
    readonly name: string;

    /** Name of the parent package. */
    readonly packageName: string;

    /** Locale-dependant i18n messages. */
    readonly intl: PackageIntl;

    /** Service properties made available via the service's constructor. */
    readonly properties: Readonly<Record<string, unknown>>;

    /** Dependencies required by the service constructor. */
    readonly dependencies: readonly ServiceDependency[];

    /** Interfaces provided by the service. */
    readonly interfaces: readonly Readonly<InterfaceSpec>[];

    /** Number of references to this service. */
    private _useCount = 0;

    /** Service factory to construct an instance. */
    private factory: ServiceFactory;

    /** Current state of this service. "constructed" -> instance is available. */
    private _state: ServiceState = "not-constructed";

    /** Service instance, once constructed. */
    private _instance: Service | undefined = undefined;

    constructor(options: ServiceReprOptions) {
        const {
            name,
            packageName,
            factory,
            intl,
            dependencies = [],
            interfaces = [],
            properties = {}
        } = options;
        if (!isValidServiceName(name)) {
            throw new Error(ErrorId.INTERNAL, `Invalid service name: '${name}'.`);
        }

        this.id = `${packageName}::${name}`;
        this.name = name;
        this.packageName = packageName;
        this.factory = factory;
        this.intl = intl;
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

    /** Returns the current reference count. */
    get useCount() {
        return this._useCount;
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

    /**
     * Called before `create()` to place the service into the `constructing` state,
     * which is currently used to detect cycles.
     */
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
    create(options: Pick<ServiceOptions, "references" | "referencesMeta">) {
        if (this._state !== "constructing" || this.instance !== undefined) {
            throw new Error(
                ErrorId.INTERNAL,
                "Inconsistent state: service is not being constructed."
            );
        }
        try {
            this._instance = createService(this.factory, {
                ...options,
                properties: this.properties,
                intl: this.intl
            });
            this._state = "constructed";
            this._useCount = 1;
            return this._instance;
        } catch (e) {
            throw new Error(
                ErrorId.SERVICE_CONSTRUCTION_FAILED,
                `Failed to create service instance '${this.id}'.`,
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
                    `Failed to destroy service instance '${this.id}'.`,
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
        return (this._useCount += 1);
    }

    /**
     * Removes a use from the service's use count.
     * Returns the new use count.
     */
    removeRef() {
        return (this._useCount -= 1);
    }
}

export function createConstructorFactory<T extends {}>(
    clazz: ServiceConstructor<T>
): ConstructorFactory {
    return { type: "class", clazz };
}

export function createFunctionFactory(
    create: (options: ServiceOptions) => Service
): FunctionFactory {
    return { type: "function", create };
}

const SERVICE_NAME_REGEX = /^[a-z0-9_-]+$/i;

function isValidServiceName(name: string) {
    return SERVICE_NAME_REGEX.test(name);
}

function createService(factory: ServiceFactory, options: ServiceOptions) {
    switch (factory.type) {
        case "class":
            return new factory.clazz(options);
        case "function":
            return factory.create(options);
    }
}
