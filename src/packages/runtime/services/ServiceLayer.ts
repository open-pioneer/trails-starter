import { ServiceRepr } from "./ServiceRepr";
import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { UIDependency, verifyDependencies } from "./verifyDependencies";
import { PackageRepr } from "./PackageRepr";
import { Service } from "../Service";

export type ServiceLookupResult = FoundService | UnimplementedService | UndeclaredDependency;

export interface FoundService {
    type: "found";
    instance: Service;
}

export interface UndeclaredDependency {
    type: "undeclared";
}

export interface UnimplementedService {
    type: "unimplemented";
}

export class ServiceLayer {
    readonly serviceIndex: ReadonlyMap<string, ServiceRepr>;

    private declaredDependencies = new Map<string, Set<string>>();
    private allServices: readonly ServiceRepr[];
    private state: "not-started" | "started" | "destroyed" = "not-started";

    constructor(packages: readonly PackageRepr[]) {
        this.allServices = packages.map((pkg) => pkg.services).flat();
        this.serviceIndex = verifyDependencies({
            services: this.allServices,
            uiDependencies: packages
                .map((pkg) =>
                    pkg.uiInterfaces.map<UIDependency>((interfaceName) => {
                        return {
                            packageName: pkg.name,
                            interfaceName
                        };
                    })
                )
                .flat()
        });

        for (const pkg of packages) {
            this.declaredDependencies.set(pkg.name, new Set(pkg.uiInterfaces));
        }
    }

    destroy() {
        this.allServices.forEach((value) => {
            this.destroyService(value);
        });
        this.state = "destroyed";
    }

    start() {
        if (this.state !== "not-started") {
            throw new Error(ErrorId.INTERNAL, "Service layer was already started.");
        }

        this.allServices.forEach((value) => {
            this.createService(value);
        });
        this.state = "started";
    }

    /**
     * Returns a service implementing the given interface.
     * Checks that the given package actually declared a dependency on that interface
     * to enforce coding guidelines.
     *
     * @param packageName the name of the package requesting the import
     * @param interfaceName the required interface
     *
     * @throws if the service layer is not in 'started' state or if no service implements the interface.
     */
    getService(packageName: string, interfaceName: string): ServiceLookupResult {
        if (this.state !== "started") {
            throw new Error(ErrorId.INTERNAL, "Service layer is not started.");
        }

        const instance = this.serviceIndex.get(interfaceName)?.instance;
        if (!instance) {
            return { type: "unimplemented" };
        }

        const isDeclared = this.declaredDependencies.get(packageName)?.has(interfaceName) ?? false;
        if (!isDeclared) {
            return { type: "undeclared" };
        }

        return {
            type: "found",
            instance: instance
        };
    }

    /**
     * Initializes the given service and its dependencies.
     * Dependencies are initialized before the service that requires them.
     */
    private createService(service: ServiceRepr) {
        if (service.state === "constructed") {
            const instance = service.getInstanceOrThrow();
            service.addRef();
            return instance;
        }
        if (service.state === "constructing") {
            throw new Error(ErrorId.INTERNAL, "Cycle during service construction.");
        }
        if (service.state !== "not-constructed") {
            throw new Error(ErrorId.INTERNAL, "Invalid service state.");
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const instances: Record<string, any> = {};

        // Sets state to 'constructing' to detect cycles
        service.beforeCreate();

        // Initialize dependencies recursively before creating the current service.
        service.dependencies.forEach((d) => {
            const serviceRef = this.serviceIndex.get(d.interfaceName);
            if (serviceRef) {
                const instance = this.createService(serviceRef);
                instances[d.referenceName] = instance;
            } else {
                throw new Error(ErrorId.INTERNAL, "Service not defined.");
            }
        });

        // Sets state to 'constructed' to finish the state transition, useCount is 1.
        return service.create({ references: instances, properties: service.properties });
    }

    /**
     * Destroys the given service and its dependencies.
     * The dependencies are destroyed after the service.
     */
    private destroyService(service: ServiceRepr) {
        if (service.state === "destroyed") {
            return;
        }

        // Destroy the service before its dependencies (reverse order
        // compared to construction).
        if (service.removeRef() <= 0) {
            service.destroy();
        }

        service.dependencies.forEach((d) => {
            const serviceRef = this.serviceIndex.get(d.interfaceName);
            if (serviceRef) {
                this.destroyService(serviceRef);
            }
        });
    }
}
