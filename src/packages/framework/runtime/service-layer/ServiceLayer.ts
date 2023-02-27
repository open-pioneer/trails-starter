// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { ServiceRepr } from "./ServiceRepr";
import { createLogger, Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import {
    ComputedServiceDependencies,
    FrameworkDependency,
    UIDependency,
    verifyDependencies
} from "./verifyDependencies";
import { PackageRepr } from "./PackageRepr";
import { ReadonlyServiceLookup, ServiceLookupResult, ServicesLookupResult } from "./ServiceLookup";
import {
    InterfaceSpec,
    isAllImplementationsSpec,
    isSingleImplementationSpec,
    ReferenceSpec,
    renderInterfaceSpec
} from "./InterfaceSpec";
import { ReferenceMeta } from "../Service";
import { RUNTIME_PACKAGE_NAME } from "../builtin-services";

const LOG = createLogger("runtime:ServiceLayer");

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
    // All services in the application.
    private allServices: ServiceRepr[];

    // Set of required services. These services and their dependencies will be started.
    private requiredServices: Set<ServiceRepr>;

    private serviceLookup: ReadonlyServiceLookup;

    // Service id --> Service dependencies
    private serviceDependencies: Map<string, ComputedServiceDependencies>;

    // Package name --> Interface name --> Declarations
    private declaredDependencies;
    private state: "not-started" | "started" | "destroyed" = "not-started";

    /**
     * Constructs a new service layer instance.
     * Requires the application's set of packages (from which services are taken)
     * and an optional set of forced references (interfaces whose implementing services will be started unconditionally).
     *
     * In its current form, the service layer will start only forced references and references needed by the UI (and their dependencies).
     */
    constructor(packages: readonly PackageRepr[], forcedReferences: ReferenceSpec[] = []) {
        const allServices = packages.map((pkg) => pkg.services).flat();
        const uiDependencies = packages
            .map((pkg) =>
                pkg.uiReferences.map<UIDependency>((dep) => {
                    return {
                        type: "ui",
                        packageName: pkg.name,
                        ...dep
                    };
                })
            )
            .flat();
        const requiredReferences = [
            ...forcedReferences.map<FrameworkDependency>((r) => ({
                type: "framework",
                ...r
            })),
            ...uiDependencies
        ];
        const { serviceLookup, serviceDependencies } = verifyDependencies({
            services: allServices,
            requiredReferences: requiredReferences
        });

        this.allServices = allServices;
        this.requiredServices = getRequiredServices(requiredReferences, serviceLookup);
        this.serviceLookup = serviceLookup;
        this.serviceDependencies = serviceDependencies;
        this.declaredDependencies = buildDependencyIndex(packages);
    }

    destroy() {
        for (const service of this.requiredServices) {
            this.destroyService(service);
        }
        this.state = "destroyed";
    }

    start() {
        if (this.state !== "not-started") {
            throw new Error(ErrorId.INTERNAL, "Service layer was already started.");
        }

        for (const service of this.requiredServices) {
            this.createService(service);
        }
        this.state = "started";

        // Give warnings for unneeded services during development.
        if (import.meta.env.DEV) {
            const unneededServices = this.allServices
                .filter(
                    (service) =>
                        service.packageName !== RUNTIME_PACKAGE_NAME &&
                        service.state === "not-constructed"
                )
                .map((service) => `'${service.id}'`);
            if (unneededServices.length) {
                const services = unneededServices.join(", ");
                LOG.warn(
                    `The following services are contained in the application but were not started: ${services}.`
                );
            }
        }
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

        return this.serviceLookup.lookupOne(spec);
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
        LOG.debug(`Creating service '${service.id}'.`);
        return service.create({ references, referencesMeta });
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
            LOG.debug(`Destroying service '${service.id}'`);
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

function getRequiredServices(
    requiredReferences: readonly ReferenceSpec[],
    serviceLookup: ReadonlyServiceLookup
): Set<ServiceRepr> {
    const requiredServices = new Set<ServiceRepr>();
    for (const referenceSpec of requiredReferences) {
        const result = serviceLookup.lookup(referenceSpec);
        if (result.type !== "found") {
            // Should be caught by verifier
            throw new Error(
                ErrorId.INTERNAL,
                `Failed to find required reference to ${renderInterfaceSpec(referenceSpec)}.`
            );
        }
        if (Array.isArray(result.value)) {
            for (const service of result.value) {
                requiredServices.add(service);
            }
        } else {
            requiredServices.add(result.value);
        }
    }
    return requiredServices;
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
