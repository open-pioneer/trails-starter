import { InterfaceReferenceMetadata, ServiceMetadata } from "../Metadata";
import { Service, ServiceConstructor } from "../Service";

// TODO: Improve readonly-ness
export interface Dependency {
    /** Injected as ... */
    name: string;

    /** Required interface */
    interface: InterfaceReferenceMetadata;
}

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
    readonly state: "not-constructed" | "constructed" | "destroyed" = "not-constructed";

    /** Service instance, once constructed. */
    readonly instance: Service | undefined = undefined;

    constructor(name: string, bundleName: string, clazz: ServiceConstructor, dependencies: Dependency[], interfaces: string[]) {
        this.id = `${bundleName}::${name}`;
        this.name = name;
        this.bundleName = bundleName;
        this.clazz = clazz;
        this.dependencies = dependencies;
        this.interfaces = interfaces;
    }
}
