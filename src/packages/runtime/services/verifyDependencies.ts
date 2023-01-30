import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { ServiceRepr } from "./ServiceRepr";

export interface DependencyOptions {
    services?: readonly ServiceRepr[];
    uiDependencies?: readonly UIDependency[];
}

export interface UIDependency {
    readonly packageName: string;
    readonly interfaceName: string;
}

/**
 * Visits all services and ensures that their dependencies can be satisfied by each other without a cycle.
 *
 * Throws an error if a cycle is detected or if a required service is never implemented.
 *
 * @returns the verified index from interface name to service class.
 */
export function verifyDependencies(options: DependencyOptions) {
    const verifier = new Verifier(options);
    verifier.verify();
    return verifier.getServiceIndex();
}

interface GraphItem {
    service: ServiceRepr;
    state: ItemState;
}

type ItemState = "not-visited" | "pending" | "done";

/** The reason why a graph node is being visited. */
type ItemVisitReason =
    | "root"
    | {
          type: "ui-reference";
          packageName: string;
          interfaceName: string;
      }
    | {
          type: "service-reference";
          referenceName: string;
          interfaceName: string;
      };

type InterfaceReference =
    | {
          type: "ui-reference";
          packageName: string;
      }
    | {
          type: "service-reference";
          service: ServiceRepr;
          referenceName: string;
      };

class Verifier {
    private uiDependencies: readonly UIDependency[];
    private items: GraphItem[];

    // Service name -> implementing item
    private serviceLookup = new Map<string, GraphItem>();

    // Stack of visited nodes
    private stack: [item: GraphItem, reason: ItemVisitReason][] = [];

    constructor(options: DependencyOptions) {
        this.uiDependencies = options.uiDependencies ?? [];
        const services = options.services ?? [];
        const items = (this.items = services.map<GraphItem>((service) => {
            return {
                service: service,
                state: "not-visited"
            };
        }));

        for (const item of items) {
            for (const service of item.service.interfaces) {
                this.registerService(service, item);
            }
        }
    }

    verify() {
        for (const uiDependency of this.uiDependencies) {
            this.visitInterface(uiDependency.interfaceName, {
                type: "ui-reference",
                packageName: uiDependency.packageName
            });
        }
        for (const item of this.items) {
            this.visitItem(item, "root");
        }
    }

    getServiceIndex() {
        const index = new Map<string, ServiceRepr>();
        for (const [k, v] of this.serviceLookup) {
            index.set(k, v.service);
        }
        return index;
    }

    private visitItem(item: GraphItem, reason: ItemVisitReason) {
        const stack = this.stack;
        const state = item.state;
        if (state === "done") {
            return; // Item is initialized, cycle impossible
        }
        if (state === "pending") {
            this.throwCycleError(item, reason);
        }

        stack.push([item, reason]);
        item.state = "pending";
        for (const { referenceName, interfaceName } of item.service.dependencies) {
            this.visitInterface(interfaceName, {
                type: "service-reference",
                service: item.service,
                referenceName
            });
        }
        item.state = "done";
        stack.pop();
    }

    private visitInterface(interfaceName: string, user: InterfaceReference) {
        const childItem = this.serviceLookup.get(interfaceName);
        if (!childItem) {
            const message =
                user.type === "service-reference"
                    ? `Service '${user.service.id}' requires an unimplemented interface '${interfaceName}' (as dependency '${user.referenceName}').`
                    : `The UI of package '${user.packageName}' requires an unimplemented interface '${interfaceName}'.`;

            throw new Error(ErrorId.INTERFACE_NOT_FOUND, message);
        }

        let reason: ItemVisitReason;
        switch (user.type) {
            case "service-reference":
                reason = {
                    type: "service-reference",
                    interfaceName,
                    referenceName: user.referenceName
                };
                break;
            case "ui-reference":
                reason = {
                    type: "ui-reference",
                    interfaceName,
                    packageName: user.packageName
                };
                break;
        }

        this.visitItem(childItem, reason);
    }

    private throwCycleError(item: GraphItem, reason: ItemVisitReason) {
        // Find the item on the stack (it must be there because we detected a cycle).
        const stack = this.stack;
        const ownIndex = stack.findIndex((entry) => entry[0] === item);
        if (ownIndex === -1) {
            throw new Error(ErrorId.INTERNAL, "Failed to find cycle participant on the stack.");
        }

        const cycleInfo = stack
            .slice(ownIndex)
            .concat([[item, reason]])
            .map<string>((entry, index) => {
                const item = entry[0];
                const reason = index === 0 ? "root" : entry[1]; // info before the cycle does not matter

                let message = `'${item.service.id}'`;
                if (typeof reason === "object") {
                    switch (reason.type) {
                        case "service-reference":
                            message += ` ('${reason.referenceName}' providing '${reason.interfaceName}')`;
                            break;
                        case "ui-reference":
                            message += ` (UI of package '${reason.packageName}' requiring '${reason.interfaceName}')`;
                            break;
                    }
                }
                return message;
            });
        throw new Error(
            ErrorId.DEPENDENCY_CYCLE,
            `Detected dependency cycle: ${cycleInfo.join(" => ")}.`
        );
    }

    private registerService(interfaceName: string, item: GraphItem) {
        const services = this.serviceLookup;
        const existing = services.get(interfaceName);
        if (existing) {
            throw new Error(
                ErrorId.DUPLICATE_INTERFACE,
                `Cannot register '${item.service.id}' as interface '${interfaceName}'. '${interfaceName}' is already provided by service '${existing.service.id}'.`
            );
        }
        services.set(interfaceName, item);
    }
}
