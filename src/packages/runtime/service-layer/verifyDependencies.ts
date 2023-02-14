import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import {
    InterfaceSpec,
    isSingleImplementationSpec,
    ReferenceSpec,
    renderInterfaceSpec
} from "./InterfaceSpec";
import {
    ReadonlyServiceLookup,
    renderAmbiguousServiceChoices,
    ServiceLookup
} from "./ServiceLookup";
import { ServiceRepr } from "./ServiceRepr";

export interface DependencyOptions {
    services?: readonly ServiceRepr[];
    uiDependencies?: readonly UIDependency[];
}

export type UIDependency = { packageName: string } & ReferenceSpec;

export type ComputedServiceDependencies = Record<string, ServiceRepr | ServiceRepr[]>;

export interface VerifyDependenciesResult {
    /**
     * Precomputed dependencies for every service.
     *
     * Key: service id.
     */
    serviceDependencies: Map<string, ComputedServiceDependencies>;

    /**
     * Index structure mapping interface names to service instances.
     */
    serviceLookup: ReadonlyServiceLookup;
}

/**
 * Visits all services and ensures that their dependencies can be satisfied by each other without a cycle.
 *
 * Throws an error if a cycle is detected or if a required service is never implemented.
 *
 * @returns an object containing the service index and precomputed dependency information
 */
export function verifyDependencies(options: DependencyOptions): VerifyDependenciesResult {
    const verifier = new Verifier(options);
    verifier.verify();
    return {
        serviceLookup: verifier.getServiceLookup(),
        serviceDependencies: verifier.getComputedDependencies()
    };
}

interface GraphItem {
    state: ItemState;
    service: ServiceRepr;
    dependencies: ComputedServiceDependencies;
}

type ItemState = "not-visited" | "pending" | "done";

/** The reason why a graph node is being visited. */
type ItemVisitReason = "root" | InterfaceReference;

type InterfaceReference =
    | ({
          type: "ui-reference";
          packageName: string;
      } & ReferenceSpec)
    | ({
          type: "service-reference";
          service: ServiceRepr;
          referenceName: string;
      } & ReferenceSpec);

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
                state: "not-visited",
                dependencies: {}
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
            this.visitReference({
                type: "ui-reference",
                ...uiDependency
            });
        }
        for (const item of this.items) {
            this.visitItem(item, "root");
        }
    }

    getServiceLookup() {
        return this.serviceLookup;
    }

    getComputedDependencies() {
        return new Map(
            this.items.map<[string, ComputedServiceDependencies]>((item) => {
                return [item.service.id, item.dependencies];
            })
        );
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
            item.dependencies[dep.referenceName] = this.visitReference({
                type: "service-reference",
                service: item.service,
                ...dep
            });
        }
        item.state = "done";
        stack.pop();
    }

    private visitReference(ref: InterfaceReference) {
        const itemOrItems = this.findServices(ref);
        if (Array.isArray(itemOrItems)) {
            for (const child of itemOrItems) {
                this.visitItem(child, ref);
            }
            return itemOrItems.map((item) => item.service);
        } else {
            this.visitItem(itemOrItems, ref);
            return itemOrItems.service;
        }
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

    private findServices(ref: InterfaceReference): GraphItem | GraphItem[] {
        if (isSingleImplementationSpec(ref)) {
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
            return this.getGraphItem(lookupResult.value);
        } else {
            return this.serviceLookup
                .lookupAll(ref.interfaceName)
                .value.map((service) => this.getGraphItem(service));
        }
    }

    private getGraphItem(service: ServiceRepr): GraphItem {
        const graphItem = this.serviceToGraphItem.get(service);
        if (!graphItem || graphItem.service !== service) {
            throw new Error(
                ErrorId.INTERNAL,
                `Failed to find matching graph item for service '${service.id}'.`
            );
        }
        return graphItem;
    }
}
