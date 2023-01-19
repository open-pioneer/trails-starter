import { ErrorId } from "./../errors";
import { InterfaceReferenceMetadata, ServiceMetadata } from "../Metadata";
import { Service, ServiceConstructor, ServiceOptions } from "../Service";
import { Error } from "@open-pioneer/core";

// TODO: Improve readonly-ness
export interface Dependency {
    /** Injected as ... */
    name: string;

    /** Required interface */
    interface: InterfaceReferenceMetadata;
}

type ServiceState = "not-constructed" | "constructing" | "constructed" | "destroyed";

export class ServiceRepr {
    static parse(bundleName: string, data: ServiceMetadata): ServiceRepr {
        const clazz = data.clazz;
        const name = data.name;
        const dependencies = Object.entries(data.references ?? {}).map<Dependency>(([name, referenceMetadata]) => {
            return {
                name,
                interface: referenceMetadata
            };
        });
        const interfaces = (data.provides ?? []).map(p => p.interface);
        return new ServiceRepr(name, bundleName, clazz, dependencies, interfaces);
    }

    /** Unique id of this service. Contains the bundle name and the service name. */
    readonly id: string;

    /** Name of this service in it's bundle. */
    readonly name: string;

    /** Name of the parent bundle. */
    readonly bundleName: string;

    /** Dependencies required by the service constructor. */
    readonly dependencies: readonly Dependency[];

    /** Interfaces provided by the service. */
    readonly interfaces: readonly string[];

    /** Service constructor. */
    private clazz: ServiceConstructor;

    /** Current state of this service. "constructed" -> instance is available. */
    private _state: ServiceState = "not-constructed";

    /** Service instance, once constructed. */
    private _instance: Service | undefined = undefined;

    constructor(name: string, bundleName: string, clazz: ServiceConstructor, dependencies: Dependency[], interfaces: string[]) {
        this.id = `${bundleName}::${name}`;
        this.name = name;
        this.bundleName = bundleName;
        this.clazz = clazz;
        this.dependencies = dependencies;
        this.interfaces = interfaces;
    }

    create(options: ServiceOptions) {
        if (this._state !== "constructing" || this.instance !== undefined) {
            throw new Error(ErrorId.INTERNAL, "Inconsistent state");
        }
        this._instance = new (this.clazz)(options);
        this._state = "constructed";
        return this._instance;
    }

    public get instance(): Service | undefined {
        return this._instance;
    }

    public beforeCreate() {
        if (this._state === "not-constructed") {
            this._state = "constructing";
        } else {
            throw new Error(ErrorId.INTERNAL, "Inconsistent state");
        }
    }

    public get state() {
        return this._state;
    }
    
}
