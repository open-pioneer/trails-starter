import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { InterfaceSpec, renderInterfaceSpec } from "./InterfaceSpec";
import { ReadonlyServiceLookup, ServiceLookup } from "./ServiceLookup";
import { renderAmbiguousServiceChoices, ServiceRepr } from "./ServiceRepr";

export interface DependencyOptions {
    services?: readonly ServiceRepr[];
    uiDependencies?: readonly UIDependency[];
}

export interface UIDependency extends InterfaceSpec {
    readonly packageName: string;
}

/**
 * Visits all services and ensures that their dependencies can be satisfied by each other without a cycle.
 *
 * Throws an error if a cycle is detected or if a required service is never implemented.
 *
 * @returns the verified index from interface name to service class.
 */
export function verifyDependencies(options: DependencyOptions): ReadonlyServiceLookup {
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
    | ({
          type: "ui-reference";
          packageName: string;
      } & InterfaceSpec)
    | ({
          type: "service-reference";
          referenceName: string;
      } & InterfaceSpec);

type InterfaceReference =
    | ({
          type: "ui-reference";
          packageName: string;
      } & InterfaceSpec)
    | ({
          type: "service-reference";
          service: ServiceRepr;
          referenceName: string;
      } & InterfaceSpec);

class Verifier {
    private uiDependencies: readonly UIDependency[];
    private items: GraphItem[];
    private serviceLookup = new ServiceLookup();
    private serviceToGraphItem = new Map<ServiceRepr, GraphItem>();

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
            for (const spec of item.service.interfaces) {
                this.registerService(item, spec);
            }
        }
    }

    verify() {
        for (const uiDependency of this.uiDependencies) {
            this.visitInterface({
                type: "ui-reference",
                ...uiDependency
            });
        }
        for (const item of this.items) {
            this.visitItem(item, "root");
        }
    }

    getServiceIndex() {
        return this.serviceLookup;
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
        for (const dep of item.service.dependencies) {
            this.visitInterface({
                type: "service-reference",
                service: item.service,
                ...dep
            });
        }
        item.state = "done";
        stack.pop();
    }

    private visitInterface(ref: InterfaceReference) {
        const childItem = this.findService(ref);

        let reason: ItemVisitReason;
        switch (ref.type) {
            case "service-reference":
                reason = {
                    type: "service-reference",
                    interfaceName: ref.interfaceName,
                    referenceName: ref.referenceName
                };
                break;
            case "ui-reference":
                reason = {
                    type: "ui-reference",
                    interfaceName: ref.interfaceName,
                    packageName: ref.packageName
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

    private registerService(item: GraphItem, spec: InterfaceSpec) {
        this.serviceLookup.register(item.service, spec);
        this.serviceToGraphItem.set(item.service, item);
    }

    private findService(ref: InterfaceReference) {
        const lookupResult = this.serviceLookup.lookup(ref);
        switch (lookupResult.type) {
            case "unimplemented": {
                const interfaceText = renderInterfaceSpec(ref);
                const message =
                    ref.type === "service-reference"
                        ? `Service '${ref.service.id}' requires an unimplemented interface ${interfaceText} as dependency '${ref.referenceName}'.`
                        : `The UI of package '${ref.packageName}' requires an unimplemented interface ${interfaceText}.`;
                throw new Error(ErrorId.INTERFACE_NOT_FOUND, message);
            }
            case "ambiguous": {
                const interfaceText = renderInterfaceSpec(ref);
                const serviceChoices = renderAmbiguousServiceChoices(lookupResult.choices);
                let message =
                    ref.type === "service-reference"
                        ? `Service '${ref.service.id}' requires the ambiguous interface ${interfaceText} as dependency '${ref.referenceName}'.`
                        : `The UI of package '${ref.packageName}' requires the ambiguous interface ${interfaceText}.`;
                message += ` Possible choices are ${serviceChoices}.`;
                throw new Error(ErrorId.AMBIGUOUS_DEPENDENCY, message);
            }
        }
        const foundService = lookupResult.service;
        const graphItem = this.serviceToGraphItem.get(foundService);
        if (!graphItem || graphItem.service !== foundService) {
            throw new Error(
                ErrorId.INTERNAL,
                `Failed to find matching graph item for service '${foundService.id}'.`
            );
        }
        return graphItem;
    }
}
