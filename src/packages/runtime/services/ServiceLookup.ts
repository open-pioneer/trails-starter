import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { InterfaceSpec } from "./InterfaceSpec";
import { ServiceRepr } from "./ServiceRepr";

interface Services {
    // The unqualified service implementations (if any).
    unqualified: ServiceRepr[];

    // Services indexed by their qualifier (if any).
    byQualifier: Map<string, ServiceRepr>;
}

export type ReadonlyServiceLookup = Pick<ServiceLookup, "lookup" | "lookupAll" | "serviceCount">;

export interface Unimplemented {
    type: "unimplemented";
}

export interface Ambiguous {
    type: "ambiguous";
    choices: AmbiguousChoice[];
}

export type AmbiguousChoice = [serviceId: string, qualifier: string | undefined];

export interface Found<T> {
    type: "found";
    value: T;
}

export type ServiceLookupResult = Unimplemented | Ambiguous | Found<ServiceRepr>;

export type ServicesLookupResult = Found<ServiceRepr[]>;

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
            services.unqualified.push(service);
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
            const count = services.unqualified.length + services.byQualifier.size;
            if (count > 1) {
                // [serviceId, qualifier] tuples
                const choices: AmbiguousChoice[] = [];
                choices.push(
                    ...Array.from(services.byQualifier.entries()).map<AmbiguousChoice>(
                        ([qualifier, service]) => [service.id, qualifier]
                    )
                );
                choices.push(
                    ...services.unqualified.map<AmbiguousChoice>((s) => [s.id, undefined])
                );
                return {
                    type: "ambiguous",
                    choices: choices
                };
            }

            const service = services.unqualified[0] ?? first(services.byQualifier);
            if (!service) {
                return { type: "unimplemented" };
            }
            return { type: "found", value: service };
        }

        const service = services.byQualifier.get(qualifier);
        if (!service) {
            return { type: "unimplemented" };
        }
        return { type: "found", value: service };
    }

    /**
     * Returns all services implementing the given interface.
     */
    lookupAll(interfaceName: string): ServicesLookupResult {
        if (!interfaceName) {
            throw new Error(
                ErrorId.INVALID_METADATA,
                `Invalid interface name during service lookup: '${interfaceName}'.`
            );
        }

        const services = this.services.get(interfaceName);
        if (!services) {
            return { type: "found", value: [] };
        }

        const deduped = new Set([...services.unqualified, ...services.byQualifier.values()]);
        return {
            type: "found",
            value: Array.from(deduped)
        };
    }

    private ensureInterfaceEntry(interfaceName: string): Services {
        const services = this.services;
        let entry = services.get(interfaceName);
        if (!entry) {
            entry = {
                unqualified: [],
                byQualifier: new Map()
            };
            services.set(interfaceName, entry);
        }
        return entry;
    }
}

export function renderAmbiguousServiceChoices(choices: AmbiguousChoice[], max = 2): string {
    let message = "";
    let count = 0;
    for (const [serviceId, qualifier] of choices) {
        if (count) {
            message += ", ";
        }

        message += `'${serviceId}'`;
        if (qualifier) {
            message += ` (with qualifier '${qualifier}')`;
        }

        if (++count >= max) {
            break;
        }
    }

    const remaining = choices.length - count;
    if (remaining > 0) {
        message += ` and ${remaining} more`;
    }
    return message;
}

function first<K, V>(map: Map<K, V>): V | undefined {
    return map.values().next().value;
}
