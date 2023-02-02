import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { PackageMetadata } from "../metadata";
import { ServiceRepr } from "./ServiceRepr";

export class PackageRepr {
    static parse(data: PackageMetadata): PackageRepr {
        const name = data.name;
        const properties = data.properties ?? {};

        // TODO: Allow overriding properties from app
        const resolvedProperties = Object.fromEntries(
            Object.entries(properties).map(([key, value]) => {
                return [key, value.value];
            })
        );

        const services = Object.entries(data.services ?? {}).map<ServiceRepr>(
            ([name, serviceData]) => {
                if (name !== serviceData.name) {
                    throw new Error(
                        ErrorId.INVALID_METADATA,
                        "Invalid metadata: service name mismatch."
                    );
                }
                return ServiceRepr.parse(data.name, serviceData, resolvedProperties);
            }
        );
        return new PackageRepr({ name, services, uiInterfaces: data.ui?.references });
    }

    /** Package name */
    readonly name: string;

    /** Services defined by the package */
    readonly services: readonly ServiceRepr[];

    /** Interfaces required by UI components. */
    readonly uiInterfaces: readonly string[];

    constructor(options: { name: string; services?: ServiceRepr[]; uiInterfaces?: string[] }) {
        this.name = options.name;
        this.services = options.services ?? [];
        this.uiInterfaces = options.uiInterfaces ?? [];
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
