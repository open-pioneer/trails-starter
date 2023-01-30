import { createContext, useContext, useMemo } from "react";
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
 *
 * TODO: Internal docs
 */
export function useServiceInternal<ServiceName extends keyof ServiceRegistry>(
    packageName: string, // TODO
    serviceName: ServiceName
): ServiceRegistry[ServiceName];
export function useServiceInternal(packageName: string, serviceName: string): unknown;
export function useServiceInternal(packageName: string, serviceName: string) {
    // TODO: Verify that the packageName actually declares a UI dependency on serviceName
    const context = useContext(ServiceContext);
    const service = useMemo(() => context?.getService(serviceName), [context, serviceName]);
    return service;
}
