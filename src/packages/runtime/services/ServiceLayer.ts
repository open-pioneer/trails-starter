import { BundleMetadata } from "../Metadata";
import { ServiceRepr } from "./ServiceRepr";
import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";

export class ServiceLayer {
    readonly bundles: readonly BundleRepr[];
    readonly serviceIndex: ReadonlyMap<string, ServiceRepr>;

    constructor(bundles: Record<string, BundleMetadata>) {
        this.bundles = Object.entries(bundles).map<BundleRepr>(([name, bundleMetadata]) => {
            if (name !== bundleMetadata.name) {
                throw new Error(ErrorId.INVALID_METADATA, "Invalid metadata: bundle name mismatch.");
            }
            return BundleRepr.parse(bundleMetadata);
        });
        this.serviceIndex = indexServices(this.bundles);
    }

    // start() {

    // }

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
