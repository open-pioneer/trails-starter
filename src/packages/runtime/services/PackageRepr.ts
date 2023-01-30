import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { PackageMetadata } from "../metadata";
import { ServiceRepr } from "./ServiceRepr";

export class PackageRepr {
    static parse(data: PackageMetadata): PackageRepr {
        const name = data.name;
        const services = Object.entries(data.services ?? {}).map<ServiceRepr>(
            ([name, serviceData]) => {
                if (name !== serviceData.name) {
                    throw new Error(
                        ErrorId.INVALID_METADATA,
                        "Invalid metadata: service name mismatch."
                    );
                }
                return ServiceRepr.parse(data.name, serviceData);
            }
        );
        return new PackageRepr(name, services, data.ui?.references ?? []);
    }

    /** Package name */
    readonly name: string;

    /** Services defined by the package */
    readonly services: readonly ServiceRepr[];

    /** Interfaces required by UI components. */
    readonly uiInterfaces: readonly string[];

    constructor(name: string, services: ServiceRepr[], uiInterfaces: string[]) {
        this.name = name;
        this.services = services;
        this.uiInterfaces = uiInterfaces;
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
