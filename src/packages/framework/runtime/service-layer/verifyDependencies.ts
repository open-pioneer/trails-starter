import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { InterfaceSpec, ReferenceSpec, renderInterfaceSpec } from "./InterfaceSpec";
import {
    AmbiguousChoice,
    ReadonlyServiceLookup,
    renderAmbiguousServiceChoices,
    ServiceLookup
} from "./ServiceLookup";
import { ServiceRepr } from "./ServiceRepr";

export interface DependencyOptions {
    /**
     * All services known to the service layer.
     */
    services?: readonly ServiceRepr[];

    /**
     * References that must be satisfied by the services.
     */
    requiredReferences?: readonly RequiredReference[];
}

export type RequiredReference = UIDependency | FrameworkDependency;

export type UIDependency = { type: "ui"; packageName: string } & ReferenceSpec;

export type FrameworkDependency = { type: "framework" } & ReferenceSpec;

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
    | {
          type: "framework-reference";
          value: ReferenceSpec;
      }
    | {
          type: "ui-reference";
          packageName: string;
          value: ReferenceSpec;
      }
    | {
          type: "service-reference";
          service: ServiceRepr;
          referenceName: string;
          value: ReferenceSpec;
      };

class Verifier {
    private requiredReferences: readonly RequiredReference[];
    private items: GraphItem[];
    private serviceLookup = new ServiceLookup();
    private serviceToGraphItem = new Map<ServiceRepr, GraphItem>();

    // Stack of visited nodes
    private stack: [item: GraphItem, reason: ItemVisitReason][] = [];

    constructor(options: DependencyOptions) {
        this.requiredReferences = options.requiredReferences ?? [];
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
        for (const ref of this.requiredReferences) {
            let interfaceRef: InterfaceReference;
            switch (ref.type) {
                case "framework":
                    interfaceRef = { type: "framework-reference", value: ref };
                    break;
                case "ui":
                    interfaceRef = {
                        type: "ui-reference",
                        packageName: ref.packageName,
                        value: ref
                    };
                    break;
            }
            this.visitReference(interfaceRef);
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
                referenceName: dep.referenceName,
                value: dep
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

    private registerService(item: GraphItem, spec: InterfaceSpec) {
        this.serviceLookup.register(item.service, spec);
        this.serviceToGraphItem.set(item.service, item);
    }

    private findServices(ref: InterfaceReference): GraphItem | GraphItem[] {
        const spec = ref.value;
        const lookupResult = this.serviceLookup.lookup(spec);
        switch (lookupResult.type) {
            case "unimplemented": {
                const message = unimplementedInterfaceMessage(ref);
                throw new Error(ErrorId.INTERFACE_NOT_FOUND, message);
            }
            case "ambiguous": {
                const message = ambiguousInterfaceMessage(ref, lookupResult.choices);
                throw new Error(ErrorId.AMBIGUOUS_DEPENDENCY, message);
            }
        }

        const value = lookupResult.value;
        if (Array.isArray(value)) {
            return value.map((service) => this.getGraphItem(service));
        } else {
            return this.getGraphItem(value);
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
                    message += ` (${referenceDetail(reason)})`;
                }
                return message;
            });
        throw new Error(
            ErrorId.DEPENDENCY_CYCLE,
            `Detected dependency cycle: ${cycleInfo.join(" => ")}.`
        );
    }
}

function unimplementedInterfaceMessage(ref: InterfaceReference): string {
    const interfaceText = renderInterfaceSpec(ref.value);
    switch (ref.type) {
        case "service-reference":
            return `Service '${ref.service.id}' requires an unimplemented interface ${interfaceText} as dependency '${ref.referenceName}'.`;
        case "ui-reference":
            return `The UI of package '${ref.packageName}' requires an unimplemented interface ${interfaceText}.`;
        case "framework-reference":
            return `The framework requires an unimplemented interface ${interfaceText}.`;
    }
}

function ambiguousInterfaceMessage(ref: InterfaceReference, choices: AmbiguousChoice[]): string {
    const interfaceText = renderInterfaceSpec(ref.value);
    const serviceChoices = renderAmbiguousServiceChoices(choices);

    let message = "";
    switch (ref.type) {
        case "service-reference":
            message = `Service '${ref.service.id}' requires the ambiguous interface ${interfaceText} as dependency '${ref.referenceName}'.`;
            break;
        case "ui-reference":
            message = `The UI of package '${ref.packageName}' requires the ambiguous interface ${interfaceText}.`;
            break;
        case "framework-reference":
            message = `The framework requires the ambiguous interface ${interfaceText}.`;
            break;
    }
    message += ` Possible choices are ${serviceChoices}.`;
    return message;
}

function referenceDetail(reason: InterfaceReference) {
    switch (reason.type) {
        case "service-reference":
            return `'${reason.referenceName}' providing '${reason.value.interfaceName}'`;
        case "ui-reference":
            return `UI of package '${reason.packageName}' requiring '${reason.value.interfaceName}'`;
        case "framework-reference":
            return `framework requiring '${reason.value.interfaceName}'`;
    }
}
