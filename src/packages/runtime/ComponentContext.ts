import { createContext, useContext, useRef } from "react";
import { ServiceLifecycleHooks } from "./Service";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceRegistry {}

export interface ComponentContext {
    getService: (serviceName: string) => ServiceLifecycleHooks;
}

export const ServiceContext = createContext<ComponentContext | null>(null);

/**
 * Returns a service which is defined in the packages section as a reference in {@link CustomElementOptions}.
 *
 * A complete service name with package declaration is needed (e.g. "logging.LogService")
 */
export function useService<ServiceName extends keyof ServiceRegistry>(
    serviceName: ServiceName
): ServiceRegistry[ServiceName];
export function useService(serviceName: string): unknown;
export function useService(serviceName: string) {
    const context = useContext(ServiceContext);
    const service = useRef<unknown>(null);
    if (!service.current) {
        // Service instance currently never changes after successful lookup
        service.current = context?.getService(serviceName);
    }
    return service.current;
}
