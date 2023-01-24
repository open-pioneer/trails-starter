import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { ServiceRepr } from "./ServiceRepr";

/**
 * Visits all services and ensures that their dependencies can be satisfied by each other without a cycle.
 *
 * Throws an error if a cycle is detected or if a required service is never implemented.
 *
 * @returns the verified index from interface name to service class.
 */
export function verifyDependencies(services: readonly ServiceRepr[]) {
    const verifier = new Verifier(services);
    verifier.verify();
    return verifier.getServiceIndex();
}

interface GraphItem {
    service: ServiceRepr;
    state: ItemState;
}

type ItemState = "not-visited" | "pending" | "done";

/** The reason why a graph node is being visited. */
type Reason =
    | "root"
    | {
          name: string;
          interfaceName: string;
      };

class Verifier {
    private items: GraphItem[];

    // Service name -> implementing item
    private services = new Map<string, GraphItem>();

    // Stack of visited nodes
    private stack: [item: GraphItem, reason: Reason][] = [];

    constructor(services: readonly ServiceRepr[]) {
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
        for (const item of this.items) {
            this.visitItem(item, "root");
        }
    }

    getServiceIndex() {
        const index = new Map<string, ServiceRepr>();
        for (const [k, v] of this.services) {
            index.set(k, v.service);
        }
        return index;
    }

    private visitItem(item: GraphItem, reason: Reason) {
        const stack = this.stack;
        const services = this.services;
        const state = item.state;
        if (state === "done") {
            return; // Item is initialized, cycle impossible
        }
        if (state === "pending") {
            this.throwCycleError(item, reason);
        }

        stack.push([item, reason]);
        item.state = "pending";
        for (const { referenceName, interfaceName } of item.service
            .dependencies) {
            const childItem = services.get(interfaceName);
            if (!childItem) {
                throw new Error(
                    ErrorId.INTERFACE_NOT_FOUND,
                    `Service '${item.service.id}' requires an unimplemented interface '${interfaceName}' (as dependency '${referenceName}').`
                );
            }

            this.visitItem(childItem, { name: referenceName, interfaceName });
        }
        item.state = "done";
        stack.pop();
    }

    private throwCycleError(item: GraphItem, reason: Reason) {
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
                if (reason !== "root") {
                    message += ` ('${reason.name}' providing '${reason.interfaceName}')`;
                }
                return message;
            });
        throw new Error(
            ErrorId.DEPENDENCY_CYCLE,
            `Detected dependency cycle: ${cycleInfo.join(" => ")}.`
        );
    }

    private registerService(interfaceName: string, item: GraphItem) {
        const services = this.services;
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
