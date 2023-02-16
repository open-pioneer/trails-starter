import { ServiceRepr } from "./ServiceRepr";
import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import {
    ComputedServiceDependencies,
    UIDependency,
    verifyDependencies
} from "./verifyDependencies";
import { PackageRepr } from "./PackageRepr";
import { ReadonlyServiceLookup, ServiceLookupResult, ServicesLookupResult } from "./ServiceLookup";
import {
    InterfaceSpec,
    isAllImplementationsSpec,
    isSingleImplementationSpec,
    ReferenceSpec
} from "./InterfaceSpec";
import { ReferenceMeta } from "../Service";

export type DynamicLookupResult = ServiceLookupResult | UndeclaredDependency;

export interface UndeclaredDependency {
    type: "undeclared";
}

interface DependencyDeclarations {
    all: boolean;
    unqualified: boolean;
    qualifiers: Set<string>;
}

export class ServiceLayer {
    private serviceLookup: ReadonlyServiceLookup;

    // Service id --> Service dependencies
    private serviceDependencies: Map<string, ComputedServiceDependencies>;

    // Package name --> Interface name --> Declarations
    private declaredDependencies;
    private allServices: readonly ServiceRepr[];
    private state: "not-started" | "started" | "destroyed" = "not-started";

    constructor(packages: readonly PackageRepr[]) {
        this.allServices = packages.map((pkg) => pkg.services).flat();
        const { serviceLookup, serviceDependencies } = verifyDependencies({
            services: this.allServices,
            uiDependencies: packages
                .map((pkg) =>
                    pkg.uiReferences.map<UIDependency>((dep) => {
                        return {
                            packageName: pkg.name,
                            ...dep
                        };
                    })
                )
                .flat()
        });
        this.serviceLookup = serviceLookup;
        this.serviceDependencies = serviceDependencies;
        this.declaredDependencies = buildDependencyIndex(packages);
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
     * @param spec the interface specifier
     * @param options advanced options to customize lookup
     * @throws if the service layer is not in 'started' state or if no service implements the interface.
     */
    getService(
        packageName: string,
        spec: InterfaceSpec,
        options?: { ignoreDeclarationCheck?: boolean }
    ): ServiceLookupResult | UndeclaredDependency {
        if (this.state !== "started") {
            throw new Error(ErrorId.INTERNAL, "Service layer is not started.");
        }

        if (!options?.ignoreDeclarationCheck && !this.isDeclaredDependency(packageName, spec)) {
            return { type: "undeclared" };
        }

        return this.serviceLookup.lookup(spec);
    }

    /**
     * Returns all services implementing the given interface.
     * Requires that the dependency on all implementations has been declared in the package.
     *
     * @param packageName the name of the package requesting the import
     * @param interfaceName the interface name
     *
     * @throws if the service layer is not in 'started'.
     */
    getServices(
        packageName: string,
        interfaceName: string
    ): ServicesLookupResult | UndeclaredDependency {
        if (this.state !== "started") {
            throw new Error(ErrorId.INTERNAL, "Service layer is not started.");
        }

        if (!this.isDeclaredDependency(packageName, { interfaceName, all: true })) {
            return { type: "undeclared" };
        }

        return this.serviceLookup.lookupAll(interfaceName);
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
        const references: Record<string, any> = {};
        const referencesMeta: Record<string, ReferenceMeta | ReferenceMeta[]> = {};

        // Sets state to 'constructing' to detect cycles
        service.beforeCreate();

        // Initialize dependencies recursively before creating the current service.
        for (const [referenceName, serviceDeps] of Object.entries(this.getServiceDeps(service))) {
            const [referenceValue, referenceMeta] = this.getReference(serviceDeps);
            references[referenceName] = referenceValue;
            referencesMeta[referenceName] = referenceMeta;
        }

        // Sets state to 'constructed' to finish the state transition, useCount is 1.
        return service.create({ references, referencesMeta, properties: service.properties });
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

        for (const serviceDeps of Object.values(this.getServiceDeps(service))) {
            if (Array.isArray(serviceDeps)) {
                for (const dep of serviceDeps) {
                    this.destroyService(dep);
                }
            } else {
                this.destroyService(serviceDeps);
            }
        }
    }

    private isDeclaredDependency(packageName: string, spec: ReferenceSpec) {
        const packageEntry = this.declaredDependencies.get(packageName);
        if (!packageEntry) {
            return false;
        }
        const interfaceEntry = packageEntry.get(spec.interfaceName);
        if (!interfaceEntry) {
            return false;
        }

        if (isSingleImplementationSpec(spec)) {
            if (spec.qualifier == null) {
                return interfaceEntry.unqualified;
            }
            return interfaceEntry.qualifiers.has(spec.qualifier);
        } else {
            return interfaceEntry.all;
        }
    }

    private getReference(ref: ServiceRepr): [unknown, ReferenceMeta];
    private getReference(ref: ServiceRepr[]): [unknown[], ReferenceMeta[]];
    private getReference(
        ref: ServiceRepr | ServiceRepr[]
    ): [unknown, ReferenceMeta] | [unknown[], ReferenceMeta[]];
    private getReference(
        ref: ServiceRepr | ServiceRepr[]
    ): [unknown, ReferenceMeta] | [unknown[], ReferenceMeta[]] {
        if (Array.isArray(ref)) {
            const referenceValues: unknown[] = [];
            const referenceMeta: ReferenceMeta[] = [];
            for (const d of ref) {
                const [value, meta] = this.getReference(d);
                referenceValues.push(value);
                referenceMeta.push(meta);
            }
            return [referenceValues, referenceMeta];
        }

        const referenceValue = this.createService(ref);
        const referenceMeta: ReferenceMeta = {
            serviceId: ref.id
        };
        return [referenceValue, referenceMeta];
    }

    private getServiceDeps(service: ServiceRepr) {
        const dependencies = this.serviceDependencies.get(service.id);
        if (!dependencies) {
            throw new Error(
                ErrorId.INTERNAL,
                `Failed to find precomputed service dependencies for '${service.id}'.`
            );
        }
        return dependencies;
    }
}

function buildDependencyIndex(packages: readonly PackageRepr[]) {
    // Register declared UI dependencies.
    // This is needed as a lookup structure to that dynamic service lookups
    // can be validated at runtime.
    const index = new Map<string, Map<string, DependencyDeclarations>>();
    for (const pkg of packages) {
        const packageName = pkg.name;
        const packageEntry = new Map<string, DependencyDeclarations>();
        for (const uiReference of pkg.uiReferences) {
            let interfaceEntry = packageEntry.get(uiReference.interfaceName);
            if (!interfaceEntry) {
                interfaceEntry = {
                    all: false,
                    unqualified: false,
                    qualifiers: new Set<string>()
                };
                packageEntry.set(uiReference.interfaceName, interfaceEntry);
            }

            if (isAllImplementationsSpec(uiReference)) {
                interfaceEntry.all = true;
            } else if (uiReference.qualifier == null) {
                interfaceEntry.unqualified = true;
            } else {
                interfaceEntry.qualifiers.add(uiReference.qualifier);
            }
        }
        index.set(packageName, packageEntry);
    }
    return index;
}
