import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { InterfaceSpec } from "./InterfaceSpec";
import { ServiceRepr } from "./ServiceRepr";

interface Services {
    // The unqualified service implementation (if any).
    unqualified: ServiceRepr | undefined;

    // Services indexed by their qualifier (if any).
    byQualifier: Map<string, ServiceRepr>;
}

export type ReadonlyServiceLookup = Pick<ServiceLookup, "lookup" | "serviceCount">;

export interface Unimplemented {
    type: "unimplemented";
}

export interface Ambiguous {
    type: "ambiguous";
    choices: ServiceRepr[];
}

export interface Found {
    type: "found";
    service: ServiceRepr;
}

export type ServiceLookupResult = Unimplemented | Ambiguous | Found;

export class ServiceLookup {
    // Service implementations indexed by interface name.
    private services = new Map<string, Services>();

    // Total service count
    private _count = 0;

    /**
     * Returns the total number of registered services.
     */
    get serviceCount() {
        return this._count;
    }

    /**
     * Attempts to register the given service as an implementation of `interfaceName`.
     * Throws if the registration did not complete successfully.
     *
     * All services should be registered before any lookups are attempted.
     */
    register(service: ServiceRepr, { interfaceName, qualifier }: InterfaceSpec): void {
        if (!interfaceName) {
            throw new Error(
                ErrorId.INVALID_METADATA,
                `Service '${service.id}' provides invalid interface '${interfaceName}'.`
            );
        }
        if (qualifier != null && !qualifier) {
            throw new Error(
                ErrorId.INVALID_METADATA,
                `Service '${service.id}' uses an invalid qualifier for interface '${interfaceName}': '${qualifier}'.`
            );
        }

        const services = this.ensureInterfaceEntry(interfaceName);
        if (!qualifier) {
            if (services.unqualified) {
                throw new Error(
                    ErrorId.DUPLICATE_INTERFACE,
                    `Cannot register '${service.id}' as interface '${interfaceName}'.` +
                        ` '${interfaceName}' is already provided by service '${services.unqualified.id}'.` +
                        ` If you intend you have multiple implementations in your application, you must use the 'qualifier' attribute.`
                );
            }
            services.unqualified = service;
            ++this._count;
            return;
        }

        const existingQualified = services.byQualifier.get(qualifier);
        if (existingQualified) {
            throw new Error(
                ErrorId.DUPLICATE_INTERFACE,
                `Cannot register '${service.id}' as interface '${interfaceName}' with qualifier '${qualifier}'.` +
                    ` The interface is already provided by service '${existingQualified.id}'.` +
                    ` You can choose a different qualifier or remove the service to resolve the collision.`
            );
        }
        services.byQualifier.set(qualifier, service);
        ++this._count;
    }

    /**
     * Attempts to find a service implementing the given interface.
     */
    lookup({ interfaceName, qualifier }: InterfaceSpec): ServiceLookupResult {
        if (!interfaceName) {
            throw new Error(
                ErrorId.INVALID_METADATA,
                `Invalid interface name during service lookup: '${interfaceName}'.`
            );
        }
        if (qualifier != null && !qualifier) {
            throw new Error(
                ErrorId.INVALID_METADATA,
                `Invalid qualifier during service lookup of interface '${interfaceName}': '${qualifier}'.`
            );
        }

        const services = this.services.get(interfaceName);
        if (!services) {
            return { type: "unimplemented" };
        }

        if (!qualifier) {
            // Just pick one, but the choice must be unambiguous.
            const count = (services.unqualified ? 1 : 0) + services.byQualifier.size;
            if (count > 1) {
                return {
                    type: "ambiguous",
                    choices: (services.unqualified ? [services.unqualified] : []).concat(
                        Array.from(services.byQualifier.values())
                    )
                };
            }

            const service = services.unqualified ?? first(services.byQualifier);
            if (!service) {
                return { type: "unimplemented" };
            }
            return { type: "found", service: service };
        }

        const service = services.byQualifier.get(qualifier);
        if (!service) {
            return { type: "unimplemented" };
        }
        return { type: "found", service: service };
    }

    private ensureInterfaceEntry(interfaceName: string): Services {
        const services = this.services;
        let entry = services.get(interfaceName);
        if (!entry) {
            entry = {
                unqualified: undefined,
                byQualifier: new Map()
            };
            services.set(interfaceName, entry);
        }
        return entry;
    }
}

function first<K, V>(map: Map<K, V>): V | undefined {
    return map.values().next().value;
}
