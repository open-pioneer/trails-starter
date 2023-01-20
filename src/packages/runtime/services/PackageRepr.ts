import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { PackageMetadata } from "../Metadata";
import { ServiceRepr } from "./ServiceRepr";

export class PackageRepr {
    static parse(data: PackageMetadata): PackageRepr {
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
        return new PackageRepr(name, services);
    }

    readonly name: string;
    readonly services: readonly ServiceRepr[];

    constructor(name: string, services: ServiceRepr[]) {
        this.name = name;
        this.services = services;
    }
}

export function parsePackages(packages: Record<string, PackageMetadata>) {
    return Object.entries(packages).map<PackageRepr>(([name, packageMetadata]) => {
        if (name !== packageMetadata.name) {
            throw new Error(ErrorId.INVALID_METADATA, "Invalid metadata: package name mismatch.");
        }

        return PackageRepr.parse(packageMetadata);
    });
}
