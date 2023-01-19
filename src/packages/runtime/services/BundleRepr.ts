import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { BundleMetadata } from "../Metadata";
import { ServiceRepr } from "./ServiceRepr";

export class BundleRepr {
    static parse(data: BundleMetadata): BundleRepr {
        const name = data.name;
        const services = Object.entries(data.services).map<ServiceRepr>(([name, serviceData]) => {
            if (name !== serviceData.name) {
                throw new Error(
                    ErrorId.INVALID_METADATA,
                    "Invalid metadata: service name mismatch."
                );
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

export function parseBundles(bundles: Record<string, BundleMetadata>) {
    return Object.entries(bundles).map<BundleRepr>(([name, bundleMetadata]) => {
        if (name !== bundleMetadata.name) {
            throw new Error(ErrorId.INVALID_METADATA, "Invalid metadata: bundle name mismatch.");
        }

        return BundleRepr.parse(bundleMetadata);
    });
}
