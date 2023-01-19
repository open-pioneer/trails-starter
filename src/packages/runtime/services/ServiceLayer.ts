import { BundleMetadata } from "../Metadata";
import { ServiceRepr } from "./ServiceRepr";
import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { verifyDependencies } from "./verifyDependencies";
export class ServiceLayer {
    readonly bundles: readonly BundleRepr[];
    readonly allServices: ServiceRepr[] = [];
    readonly serviceIndex: ReadonlyMap<string, ServiceRepr>;

    constructor(bundles: Record<string, BundleMetadata>) {
        this.bundles = Object.entries(bundles).map<BundleRepr>(([name, bundleMetadata]) => {
            if (name !== bundleMetadata.name) {
                throw new Error(ErrorId.INVALID_METADATA, "Invalid metadata: bundle name mismatch.");
            }
            const bundles = BundleRepr.parse(bundleMetadata);
            this.allServices.push(...bundles.services);
            return bundles;
        });
        this.serviceIndex = indexServices(this.bundles);
        verifyDependencies(this.allServices);
    }

    start() {
        this.allServices.forEach((value) => {
            this.initService(value);
        });
    }

    initService(service: ServiceRepr) {
        if (service.state === "constructing") {
            throw new Error(ErrorId.INTERNAL, "Cycle during service construction");
        }

        if (service.state !== "not-constructed") {
            if (service.state === "constructed") {
                return service.instance;
            }
            throw new Error(ErrorId.INTERNAL, "Unknown construction state");
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const instances : Record<string, any> = {};
        service.beforeCreate();
        service.dependencies.forEach(d => {
            const serviceRef = this.serviceIndex.get(d.interface.interface);
            if (serviceRef) {
                const instance = this.initService(serviceRef);
                instances[d.name] = instance;
            } else {
                throw new Error(ErrorId.INTERNAL, "Service not defined");
            }
        });
        return service.create({references: instances});
    }

    // stop() {

    // }
}

// TODO: Needed? Can transport index from verify
function indexServices(bundles: readonly BundleRepr[]): Map<string, ServiceRepr> {
    const index = new Map<string, ServiceRepr>();
    for (const bundle of bundles) {
        for (const service of bundle.services) {
            for (const interfaceName of service.interfaces) {
                const existing = index.get(interfaceName);
                if (existing) {
                    throw new Error(
                        ErrorId.DUPLICATE_INTERFACE, 
                        `Cannot register '${service.id}' as interface '${interfaceName}'. '${interfaceName}' is already provided by service '${existing.id}'.`
                    );
                }
                index.set(interfaceName, service);
            }
        }
    }
    return index;
}


class BundleRepr {
    static parse(data: BundleMetadata): BundleRepr {
        const name = data.name;
        const services = Object.entries(data.services).map<ServiceRepr>(([name, serviceData]) => {
            if (name !== serviceData.name) {
                throw new Error(ErrorId.INVALID_METADATA, "Invalid metadata: service name mismatch");
            }
            return ServiceRepr.parse(data.name, serviceData);
        });
        return new BundleRepr(name, services);
    }

    readonly name: string;
    readonly services: readonly ServiceRepr[];

    constructor(name: string, services: ServiceRepr[]) {
        this.name = name;
        this.services = services;
    }
}
